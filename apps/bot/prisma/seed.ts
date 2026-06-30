import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const guild = await prisma.guild.upsert({
    where: { id: '000000000000000000' },
    update: {},
    create: {
      id: '000000000000000000',
      welcomeEnabled: true,
      welcomeChannelId: '000000000000000000',
      welcomeMessage: 'Selamat datang {user} di server! Member ke-{memberCount}',
      goodbyeEnabled: true,
      goodbyeChannelId: '000000000000000000',
      goodbyeMessage: '{user} telah meninggalkan server.',
      autoRoleId: null,
      xpPerMessage: 10,
      xpCooldownSec: 60,
    },
  });

  console.log('Seeded guild:', guild.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
