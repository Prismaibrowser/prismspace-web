'use client';

interface GitReferenceProps {
  onClose?: () => void;
}

export function GitReference({ onClose }: GitReferenceProps) {
  const commands = [
    {
      category: 'Setup & Config',
      items: [
        { cmd: 'git config --global user.name "[name]"', desc: 'Set your name' },
        { cmd: 'git config --global user.email "[email]"', desc: 'Set your email' },
        { cmd: 'git init', desc: 'Initialize a repository' },
        { cmd: 'git clone [url]', desc: 'Clone a repository' },
      ],
    },
    {
      category: 'Basic Commands',
      items: [
        { cmd: 'git status', desc: 'Check status of files' },
        { cmd: 'git add [file]', desc: 'Stage a file' },
        { cmd: 'git add .', desc: 'Stage all files' },
        { cmd: 'git commit -m "[message]"', desc: 'Commit staged changes' },
        { cmd: 'git push', desc: 'Push commits to remote' },
        { cmd: 'git pull', desc: 'Pull changes from remote' },
      ],
    },
    {
      category: 'Branching',
      items: [
        { cmd: 'git branch', desc: 'List branches' },
        { cmd: 'git branch [name]', desc: 'Create a new branch' },
        { cmd: 'git checkout [branch]', desc: 'Switch to a branch' },
        { cmd: 'git checkout -b [name]', desc: 'Create and switch to new branch' },
        { cmd: 'git merge [branch]', desc: 'Merge branch into current' },
        { cmd: 'git branch -d [name]', desc: 'Delete a branch' },
      ],
    },
    {
      category: 'Inspection',
      items: [
        { cmd: 'git log', desc: 'View commit history' },
        { cmd: 'git log --oneline', desc: 'Compact commit history' },
        { cmd: 'git diff', desc: 'Show unstaged changes' },
        { cmd: 'git diff --staged', desc: 'Show staged changes' },
        { cmd: 'git show [commit]', desc: 'Show commit details' },
      ],
    },
    {
      category: 'Undo Changes',
      items: [
        { cmd: 'git restore [file]', desc: 'Discard changes in file' },
        { cmd: 'git restore --staged [file]', desc: 'Unstage a file' },
        { cmd: 'git reset HEAD~1', desc: 'Undo last commit (keep changes)' },
        { cmd: 'git reset --hard HEAD~1', desc: 'Undo last commit (discard changes)' },
        { cmd: 'git revert [commit]', desc: 'Create new commit that undoes changes' },
      ],
    },
    {
      category: 'Remote',
      items: [
        { cmd: 'git remote -v', desc: 'List remote repositories' },
        { cmd: 'git remote add [name] [url]', desc: 'Add a remote' },
        { cmd: 'git fetch', desc: 'Fetch changes from remote' },
        { cmd: 'git push origin [branch]', desc: 'Push branch to remote' },
        { cmd: 'git push -u origin [branch]', desc: 'Push and set upstream' },
      ],
    },
    {
      category: 'Stash',
      items: [
        { cmd: 'git stash', desc: 'Stash current changes' },
        { cmd: 'git stash list', desc: 'List stashes' },
        { cmd: 'git stash pop', desc: 'Apply and remove latest stash' },
        { cmd: 'git stash apply', desc: 'Apply latest stash (keep it)' },
        { cmd: 'git stash drop', desc: 'Delete latest stash' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-radial from-[#17293c] via-[#0a0d12] to-[#0a0d12] text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Git Command Reference</h1>
          <p className="text-sm text-slate-400 mt-2">
            Quick reference guide for common Git commands
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {commands.map((section) => (
            <section
              key={section.category}
              className="bg-[rgba(18,24,32,0.94)] border border-[#283341] rounded-[18px] p-[18px]"
            >
              <h2 className="text-xl font-bold mb-4 text-emerald-400">
                {section.category}
              </h2>
              
              <div className="space-y-3">
                {section.items.map((item, index) => (
                  <div
                    key={index}
                    className="bg-[#0f141b] border border-[#283341] rounded-xl p-3"
                  >
                    <code className="text-sm text-blue-300 font-mono block mb-1">
                      {item.cmd}
                    </code>
                    <div className="text-xs text-slate-400">{item.desc}</div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-6 bg-[rgba(18,24,32,0.94)] border border-[#283341] rounded-[18px] p-[18px]">
          <h2 className="text-xl font-bold mb-3 text-amber-400">
            Tips & Best Practices
          </h2>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>• Always pull before pushing to avoid conflicts</li>
            <li>• Write clear, descriptive commit messages</li>
            <li>• Commit often, but keep commits logical and atomic</li>
            <li>• Use branches for new features or experiments</li>
            <li>• Review changes before committing (git diff)</li>
            <li>• Never force push to shared branches</li>
            <li>• Use .gitignore to exclude unnecessary files</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
