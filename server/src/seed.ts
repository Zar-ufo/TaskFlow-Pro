import { bootstrapAdmin } from './bootstrap.js';

async function main() {
  await bootstrapAdmin();
}

main()
  .then(async () => {
    // prisma disconnect handled by process exit / server lifecycle
  })
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  });
