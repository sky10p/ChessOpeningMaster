# Migration Scripts

## Comments Migration

The script `migrateRepertoireComments.ts` is used to copy comments from repertoires to the positions collection.

### Features

- Comments in repertoires are preserved during migration
- Comments are copied to the positions collection for better performance and reuse
- Conflicts can be resolved using different strategies

### Usage

To run the migration with automatic conflict resolution:

```bash
yarn migrate:comments [strategy]
```

Where `strategy` can be:

- `keep_longest` (default): Keep the longest comment in case of conflicts
- `keep_newest`: Keep the most recently updated comment
- `merge`: Merge all conflicting comments with newlines between them
- `interactive`: Prompt for each conflict to manually decide how to resolve it

To run the migration with interactive conflict resolution:

```bash
yarn migrate:comments:interactive
```

In interactive mode, when a conflict is found, you'll be presented with options to:

1. Keep existing position comment (if any)
2. Keep a specific comment from a repertoire
3. Merge all comments
4. Enter a custom comment

This allows you to manually decide how to handle each conflict during the migration process.
