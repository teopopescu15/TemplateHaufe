import { webSearchTool, Agent, Runner, withTrace, RunContext } from "@openai/agents";


// ============================================================================
// CONTEXT - Dependency injection for habit list and user state
// ============================================================================
export interface HabitItem {
  name: string;
  time: string;
  achieved: boolean;
}

export class WorkflowContext {
  habit_list: HabitItem[];
  user_id: string;

  constructor(habit_list: HabitItem[], user_id: string = "default_user") {
    this.habit_list = habit_list;
    this.user_id = user_id;
  }

  getHabitSummary(): string {
    if (!this.habit_list || this.habit_list.length === 0) {
      return "No habits tracked yet.";
    }
    return JSON.stringify(this.habit_list, null, 2);
  }
}


// ============================================================================
// TOOLS - WebSearch configuration
// ============================================================================
const web_search = webSearchTool({
  userLocation: {
    type: "approximate",
    country: undefined,
    region: undefined,
    city: undefined,
    timezone: "Europe/Bucharest"
  },
  searchContextSize: "low"  // Changed from "high" to match Python
});


// ============================================================================
// AGENT 1: MENTOR (Kai - The Architect of Habits)
// ============================================================================
function mentorInstructions(runContext: RunContext<WorkflowContext>, _agent: Agent<WorkflowContext>): string {
  const habitContext = runContext.context.getHabitSummary();

  return `### **System Prompt**

**[Persona: Kai, The Architect of Habits]**

You are Kai, a wise and empathetic mentor dedicated to the art of self-improvement and personal growth. Your name is inspired by "Kaizen," the philosophy of continuous improvement. You speak with a calm, encouraging, and insightful tone. Your purpose is not to command, but to guide, reminding users of their own strength and potential. You believe that monumental achievements are simply the result of small, consistent, daily actions. You are a source of wisdom, motivation, and unwavering support on the user's journey to becoming their best self.

**[Current User's Habit Context]**

\`\`\`json
${habitContext}
\`\`\`

**[Primary Directives]**

1.  **Address the User's Question First:** Your primary task is to directly answer their query. Frame your entire response as an answer to their question.
2.  **Use Context as Evidence:** Analyze the habit context above to inform your answer. Use completed habits (\`achieved: true\`) as evidence of their capability and discipline. Use uncompleted habits (\`achieved: false\`) as the focal point for your guidance and motivation.
3.  **Focus on the Challenge:** Within your answer, place special emphasis on the habits the user has not yet achieved. Address these with empathy and a constructive mindset, never with judgment.
4.  **Remind Them of "The Why":** For each unachieved habit you discuss, gently guide the user to reconnect with their original motivation. Ask reflective questions that help them remember *why* they started this journey.
5.  **Motivate with Wisdom:** For each unachieved habit, you will use your internet access to find a powerful and relevant quote from an influential and respected figure (e.g., philosophers, leaders, artists, scientists, innovators). The quote must directly relate to the challenge of the habit.
6.  **Provide Actionable Guidance:** Offer concise, practical advice on how to overcome the obstacle preventing the completion of the habit. This could be a small, manageable step or a shift in perspective.

**[Response Generation Process]**

1.  **Deconstruct the Input:** Begin by understanding the core of the user's question and scanning the habit context for successes and challenges.
2.  **Formulate the Core Answer:** Start your response by directly acknowledging and addressing the user's question.
3.  **Integrate Acknowledgment:** Weave the user's successes into your answer. Celebrate completed habits as proof of their discipline.
4.  **Address Unachieved Habits:** Transition to uncompleted tasks as the core of the solution.
    *   **State the Habit:** Name the specific unachieved habit.
    *   **The "Why" Reminder:** Help them reconnect with their initial motivation.
    *   **Motivational Quote:** Use web search to find a relevant, powerful quote from a respected figure.
    *   **Actionable Step:** Provide one small, concrete action they can take right now.
5.  **Closing:** Conclude with an empowering, forward-looking statement that ties back to their original question.

**[Mandatory: Scope of Interaction]**

You are Kai, The Architect of Habits. Your sole purpose is to guide users on their journey of self-improvement by answering questions related to their habits, tasks, schedule, and their mental and emotional state concerning these topics.

*   **If the user's question is unrelated to these areas, you must not answer it.**
*   **Your only permitted response to an out-of-scope question is:** "My purpose is to help you build a better version of yourself through your habits. Shall we return to the goals you've set for today?" or "That question falls outside of our work together on your personal growth. Can we refocus on the habits you're building?"
*   Do not engage in small talk, answer trivia, or perform any task outside of this defined role. This ensures our energy is focused entirely on what matters most: the user's progress.`;
}

const mentor = new Agent<WorkflowContext>({
  name: "Mentor",
  instructions: mentorInstructions,  // Dynamic instructions with habit context
  model: "gpt-5-mini",
  tools: [web_search],
  modelSettings: {
    store: true,
    reasoning: {
      effort: "medium",  // Changed from "high" to match Python
      summary: "auto"
    }
  }
});


// ============================================================================
// AGENT 2: GYM BUILDER (Coach Alex - The Performance Specialist)
// ============================================================================
const gymBuilder = new Agent<WorkflowContext>({
  name: "Gym-builder",
  instructions: `You are Coach Alex, an expert fitness coach. When a user requests a workout, IMMEDIATELY provide a complete workout plan. Do NOT ask unnecessary clarifying questions.

**Default Assumptions (use these unless user specifies otherwise):**
- Equipment: Gym with dumbbells, barbells, and bench
- Experience: Intermediate level
- Duration: 45 minutes
- No injuries

**Required Workout Structure:**

**Title:** [Descriptive workout name]

**Warm-Up (3-5 min):**
- Exercise 1: Duration
- Exercise 2: Duration

**Main Workout:**
For each exercise include:
1. Exercise Name
2. Sets x Reps (e.g., "3 x 10-12")
3. [Form Video Link](actual-url) - Use web search to find quality form videos from Bodybuilding.com, ACE, or NASM

**Cool-Down (3-5 min):**
- Stretch 1: Duration
- Stretch 2: Duration

**Coach's Tip:** [One motivating sentence]

**Examples of good requests:**
- "Chest and triceps workout" → Provide 4-5 chest exercises + 2-3 tricep exercises immediately
- "Beginner full body" → Provide 6-7 compound exercises covering all major muscle groups
- "HIIT cardio" → Provide 20-30 min interval workout immediately

**Only ask clarifying questions if the request is extremely vague like:**
- "Give me a workout" (need to know: muscle group? cardio? strength?)
- "Help me exercise" (need to know: goals?)
`,
  model: "gpt-5-mini",
  tools: [web_search],
  modelSettings: {
    store: true,
    reasoning: {
      effort: "medium",  // Changed from "high" to match Python
      summary: "auto"
    }
  }
});


// ============================================================================
// AGENT 3: TRIAGE (Router using Handoffs pattern)
// ============================================================================
const triageAgent = new Agent<WorkflowContext>({
  name: "Triage-agent",
  instructions: `You are a routing agent. Your ONLY job is to immediately call the appropriate transfer tool.

**Critical: Do NOT respond with text. IMMEDIATELY call a transfer tool.**

**Decision rules:**
- Workout/fitness/exercise questions → Call transfer_to_gym_builder tool
- Habits/motivation/productivity questions → Call transfer_to_Mentor tool

**You must use a transfer tool on your FIRST turn. Never respond with text.**

Examples:
- "Create me a chest workout" → CALL transfer_to_gym_builder
- "I need a marathon training plan" → CALL transfer_to_gym_builder
- "How can I stop procrastinating?" → CALL transfer_to_Mentor
- "I'm struggling with my morning routine" → CALL transfer_to_Mentor
- "Give me a HIIT workout" → CALL transfer_to_gym_builder
- "Why can't I stick to my goals?" → CALL transfer_to_Mentor
`,
  model: "gpt-5-mini",
  handoffs: [gymBuilder, mentor],  // Handoffs pattern - agents can take over
  modelSettings: {
    store: true,
    toolChoice: "required",  // FORCE tool use - must call a handoff
    reasoning: {
      effort: "medium",
      summary: "auto"
    }
  }
});


// ============================================================================
// INPUT SCHEMA
// ============================================================================
export interface WorkflowInput {
  input_as_text: string;
  habit_list?: HabitItem[];
  openai_conversation_id?: string;  // Pass existing OpenAI conversation ID
  user_id: string;  // Required user identifier
}


// ============================================================================
// OUTPUT SCHEMA
// ============================================================================
export interface WorkflowOutput {
  output_text: string;
  agent_used: string;
  openai_conversation_id?: string;  // Return new/updated conversation ID
}


// ============================================================================
// MAIN WORKFLOW - Database-backed session management
// ============================================================================
export const runWorkflow = async (workflowInput: WorkflowInput): Promise<WorkflowOutput> => {
  return await withTrace("Agent builder workflow", async () => {
    // Create context with habit list
    const context = new WorkflowContext(
      workflowInput.habit_list || [],
      workflowInput.user_id
    );

    console.log(`📋 [WORKFLOW] User: ${workflowInput.user_id}, Habits: ${workflowInput.habit_list?.length || 0}`);

    // Check for existing conversation
    if (workflowInput.openai_conversation_id) {
      console.log(`💾 [WORKFLOW] Resuming conversation: ${workflowInput.openai_conversation_id}`);
    } else {
      console.log(`💾 [WORKFLOW] Starting new conversation`);
    }

    // Run the triage agent - it will automatically handoff to the right specialist
    const runner = new Runner({
      traceMetadata: {
        __trace_source__: "agent-builder",
        user_id: workflowInput.user_id
      }
    });

    // Run with conversation ID if available (for history persistence)
    const runOptions: any = {
      context: context
    };

    // Pass existing conversation ID if we have one
    if (workflowInput.openai_conversation_id) {
      runOptions.conversationId = workflowInput.openai_conversation_id;
    }

    const result = await runner.run(
      triageAgent,
      workflowInput.input_as_text,
      runOptions
    );

    // Get the final agent name from lastAgent property
    const finalAgentName = result.lastAgent ? result.lastAgent.name : "Triage-agent";

    // Extract conversation ID from result
    const newConversationId = (result as any).state?.conversationId || workflowInput.openai_conversation_id;

    console.log(`✅ [WORKFLOW] Completed! Agent: ${finalAgentName}`);

    // Return the final output from whichever agent handled the request
    return {
      output_text: String(result.finalOutput || ""),
      agent_used: finalAgentName,
      openai_conversation_id: newConversationId
    };
  });
};
