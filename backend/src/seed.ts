import { seedSpecies } from './services/speciesService.js';

async function main() {
  console.log('Seeding database...');
  await seedSpecies();
  console.log('Done!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
