import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Create a test gadget
    const gadget = await prisma.gadget.create({
      data: {
        codename: "The Nighthawk",
        description: "Test gadget",
        status: "AVAILABLE"
      }
    });
    console.log('✅ Test gadget created:', gadget);

    // Cleanup
    await prisma.gadget.delete({
      where: { id: gadget.id }
    });
    console.log('✅ Test cleanup successful');

  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();