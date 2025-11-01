import React, { useState, useEffect } from 'react';
import { FolderGit2, GitBranch, ChevronDown, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import api from '@/services/api';

interface Repository {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  private: boolean;
  defaultBranch: string;
  description: string;
}

interface Branch {
  name: string;
  sha: string;
  protected: boolean;
}

interface RepositorySelectorProps {
  onRepositorySelect: (repo: Repository, branch: string) => void;
}

export const RepositorySelector: React.FC<RepositorySelectorProps> = ({
  onRepositorySelect
}) => {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);

  useEffect(() => {
    loadRepositories();
  }, []);

  const loadRepositories = async () => {
    setLoading(true);
    try {
      const response = await api.get('/github/repos');
      setRepos(response.data.repos);
    } catch (error) {
      console.error('Failed to load repositories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRepoSelect = async (repo: Repository) => {
    setSelectedRepo(repo);
    setSelectedBranch(repo.defaultBranch);

    // Load branches
    setLoadingBranches(true);
    try {
      const response = await api.get(`/github/repos/${repo.owner}/${repo.name}/branches`);
      setBranches(response.data.branches);
    } catch (error) {
      console.error('Failed to load branches:', error);
    } finally {
      setLoadingBranches(false);
    }

    // Notify parent component
    onRepositorySelect(repo, repo.defaultBranch);
  };

  const handleBranchSelect = (branch: string) => {
    setSelectedBranch(branch);
    if (selectedRepo) {
      onRepositorySelect(selectedRepo, branch);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
      {/* Repository Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-white w-full sm:w-auto min-w-0"
          >
            <FolderGit2 className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate max-w-[120px] sm:max-w-[150px] md:max-w-none">
              {selectedRepo ? selectedRepo.name : 'Select Repository'}
            </span>
            <ChevronDown className="w-4 h-4 ml-2 flex-shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="max-h-96 overflow-y-auto bg-slate-800 border-slate-700 w-full sm:w-80">
          {loading ? (
            <div className="p-2 text-slate-400 text-sm">Loading...</div>
          ) : repos.length === 0 ? (
            <div className="p-2 text-slate-400 text-sm">No repositories found</div>
          ) : (
            repos.map((repo) => (
              <DropdownMenuItem
                key={repo.id}
                onClick={() => handleRepoSelect(repo)}
                className="text-slate-200 hover:bg-slate-700 cursor-pointer"
              >
                <div className="flex flex-col w-full">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{repo.name}</span>
                    {repo.private && (
                      <Lock className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    )}
                  </div>
                  {repo.description && (
                    <span className="text-xs text-slate-400 mt-1 truncate">{repo.description}</span>
                  )}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Branch Dropdown */}
      {selectedRepo && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-white w-full sm:w-auto min-w-0"
              disabled={loadingBranches}
            >
              <GitBranch className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate max-w-[120px] sm:max-w-none">
                {loadingBranches ? 'Loading...' : selectedBranch}
              </span>
              <ChevronDown className="w-4 h-4 ml-2 flex-shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-slate-800 border-slate-700 w-full sm:w-auto">
            {branches.map((branch) => (
              <DropdownMenuItem
                key={branch.name}
                onClick={() => handleBranchSelect(branch.name)}
                className="text-slate-200 hover:bg-slate-700 cursor-pointer"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="truncate">{branch.name}</span>
                  {branch.protected && (
                    <span className="ml-2 text-xs text-yellow-400 flex-shrink-0">(protected)</span>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

export default RepositorySelector;
