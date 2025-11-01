/**
 * Code Review Service - Orchestrates the review process
 * Handles file retrieval, issue detection, and re-appearance tracking
 */

import pool from '../config/database';
import { OllamaService } from './ollamaService';
import * as repo from '../repositories/CodeReviewRepository';
import {
  ReviewRequest,
  ReviewResult,
  CreateIssueRequest,
  CodeIssue,
} from '../types/codeReview';

// ============================================================================
// TYPES
// ============================================================================

interface ModifiedFile {
  id: number;
  filePath: string;
  originalContent: string;
  currentContent: string;
  status: string;
}

// ============================================================================
// CODE REVIEW SERVICE
// ============================================================================

export class CodeReviewService {
  private ollamaService: OllamaService;

  constructor() {
    this.ollamaService = new OllamaService();
  }

  /**
   * Orchestrate the complete review process
   */
  async orchestrateReview(request: ReviewRequest): Promise<ReviewResult> {
    const startTime = Date.now();

    try {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🚀 Starting Code Review for Project ${request.projectId}`);
      console.log(`${'='.repeat(60)}\n`);

      // Step 1: Get modified files from database
      console.log('📂 Step 1: Retrieving modified files...');
      const modifiedFiles = await this.getModifiedFiles(request.projectId);

      if (modifiedFiles.length === 0) {
        console.log('⚠️  No modified files found. Skipping review.');
        return {
          success: true,
          issues: [],
          metadata: {
            filesReviewed: [],
            filesCount: 0,
            totalIssues: 0,
            newIssues: 0,
            reappearedIssues: 0,
            reviewDurationMs: Date.now() - startTime,
            modelUsed: request.config.modelName,
          },
        };
      }

      console.log(`✅ Found ${modifiedFiles.length} modified file(s):`);
      modifiedFiles.forEach((file, idx) => {
        console.log(`   ${idx + 1}. ${file.filePath}`);
      });
      console.log('');

      // Step 2: Get existing active issues to avoid duplicates
      console.log('📋 Step 2: Retrieving existing active issues...');
      const existingIssues = await repo.getActiveIssues(request.projectId);
      console.log(`✅ Found ${existingIssues.length} existing active issue(s)\n`);

      // Step 3: Save/update review configuration
      console.log('⚙️  Step 3: Saving review configuration...');
      await repo.saveConfig(request.config);
      console.log('✅ Configuration saved\n');

      // Step 4: Review each modified file
      console.log('🔍 Step 4: Reviewing files with AI...');
      const allNewIssues: CodeIssue[] = [];
      let reappearedCount = 0;

      for (const file of modifiedFiles) {
        console.log(`\n   Analyzing: ${file.filePath}`);

        // Get existing issues for this specific file
        const fileExistingIssues = existingIssues.filter(
          (issue) => issue.filePath === file.filePath
        );

        try {
          // Call Ollama to review the file
          const ollamaResponse = await this.ollamaService.reviewCode({
            filePath: file.filePath,
            fileContent: file.currentContent,
            config: request.config,
            existingIssues: fileExistingIssues,
          });

          console.log(`   ✅ Found ${ollamaResponse.issues.length} issue(s) in ${file.filePath}`);

          // Process each detected issue
          for (const ollamaIssue of ollamaResponse.issues) {
            // Check if this issue was previously resolved (re-appearance detection)
            const previousIssue = await repo.checkForReappearance(
              request.projectId,
              file.filePath,
              ollamaIssue.line_number,
              ollamaIssue.rule_id
            );

            // Create issue request
            const issueRequest: CreateIssueRequest = {
              projectId: request.projectId,
              userId: request.userId,
              filePath: file.filePath,
              lineNumber: ollamaIssue.line_number,
              columnNumber: ollamaIssue.column_number,
              endLineNumber: ollamaIssue.end_line_number,
              endColumnNumber: ollamaIssue.end_column_number,
              severity: ollamaIssue.severity,
              category: ollamaIssue.category,
              ruleId: ollamaIssue.rule_id,
              title: ollamaIssue.title,
              description: ollamaIssue.description,
              suggestion: ollamaIssue.suggestion,
              codeSnippet: ollamaIssue.code_snippet,
              suggestedFix: ollamaIssue.suggested_fix,
            };

            // Create issue with re-appearance tracking
            const createdIssue = await repo.createIssueWithReappearance(
              issueRequest,
              previousIssue
            );

            if (createdIssue.wasResolvedBefore) {
              reappearedCount++;
              console.log(`   ⚠️  RE-APPEARED: ${createdIssue.title} (Line ${createdIssue.lineNumber})`);
            }

            allNewIssues.push(createdIssue);
          }
        } catch (error) {
          console.error(`   ❌ Error reviewing ${file.filePath}:`, error);
          // Continue with other files even if one fails
        }
      }

      console.log(`\n✅ Review completed: ${allNewIssues.length} total issue(s) found`);
      console.log(`   - New issues: ${allNewIssues.length - reappearedCount}`);
      console.log(`   - Re-appeared issues: ${reappearedCount}\n`);

      // Step 5: Create review history record
      console.log('💾 Step 5: Saving review history...');
      const duration = Date.now() - startTime;

      await repo.createReviewHistory({
        projectId: request.projectId,
        userId: request.userId,
        filesReviewed: modifiedFiles.map((f) => f.filePath),
        filesCount: modifiedFiles.length,
        totalIssues: allNewIssues.length,
        newIssues: allNewIssues.length - reappearedCount,
        reappearedIssues: reappearedCount,
        reviewDurationMs: duration,
        modelUsed: request.config.modelName,
      });

      console.log(`✅ Review history saved\n`);
      console.log(`${'='.repeat(60)}`);
      console.log(`🎉 Code Review Completed in ${(duration / 1000).toFixed(2)}s`);
      console.log(`${'='.repeat(60)}\n`);

      // Return result
      return {
        success: true,
        issues: allNewIssues,
        metadata: {
          filesReviewed: modifiedFiles.map((f) => f.filePath),
          filesCount: modifiedFiles.length,
          totalIssues: allNewIssues.length,
          newIssues: allNewIssues.length - reappearedCount,
          reappearedIssues: reappearedCount,
          reviewDurationMs: duration,
          modelUsed: request.config.modelName,
        },
      };
    } catch (error) {
      console.error('\n❌ Code review failed:', error);

      return {
        success: false,
        issues: [],
        metadata: {
          filesReviewed: [],
          filesCount: 0,
          totalIssues: 0,
          newIssues: 0,
          reappearedIssues: 0,
          reviewDurationMs: Date.now() - startTime,
          modelUsed: request.config.modelName,
        },
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Get modified files from project_files table
   */
  private async getModifiedFiles(projectId: number): Promise<ModifiedFile[]> {
    const result = await pool.query(
      `SELECT id, file_path, original_content, current_content, status
       FROM project_files
       WHERE project_id = $1
         AND status = 'modified'
         AND current_content IS NOT NULL
         AND current_content != ''
       ORDER BY file_path ASC`,
      [projectId]
    );

    return result.rows.map((row) => ({
      id: row.id,
      filePath: row.file_path,
      originalContent: row.original_content || '',
      currentContent: row.current_content || '',
      status: row.status,
    }));
  }

  /**
   * Get review statistics for a project
   */
  async getReviewStatistics(projectId: number) {
    return await repo.getReviewStats(projectId);
  }

  /**
   * Check Ollama service health
   */
  async checkHealth(): Promise<{
    ollamaAvailable: boolean;
    modelAvailable: boolean;
  }> {
    const ollamaAvailable = await this.ollamaService.checkConnection();
    const modelAvailable = ollamaAvailable
      ? await this.ollamaService.checkModelAvailability('gpt-oss:120b-cloud')
      : false;

    return {
      ollamaAvailable,
      modelAvailable,
    };
  }
}

// Export singleton instance
export default new CodeReviewService();
