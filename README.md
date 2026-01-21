# crmrob

Bootstrap helper for setting up the initial git history and remote.

## Usage

Run the script from the repository root:

```bash
bash scripts/bootstrap_repo.sh [repo-name] [remote-url] [branch]
```

Arguments:
- `repo-name`: Defaults to the current directory name.
- `remote-url`: Optional. If provided and `origin` is not set, it is added.
- `branch`: Defaults to `crm`.

The script will:
- initialize git if missing
- ensure README has a title
- create the initial commit when no commits exist
- rename the current branch to the target branch
- add the origin remote when provided
- print the git push command to run
