const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main(){
  await prisma.course.createMany({
    data: [
      { code: 'MAT101', name: 'Matemáticas I', credits: 6 },
      { code: 'FIS101', name: 'Física I', credits: 6 },
      { code: 'PROG1', name: 'Programación I', credits: 6 }
    ],
    skipDuplicates: true
  });
  await prisma.professor.createMany({
    data: [
      { firstName: 'Juan', lastName: 'Pérez' },
      { firstName: 'María', lastName: 'García' }
    ],
    skipDuplicates: true
  });
  console.log('Seed completed');
}
main().catch(e=>{console.error(e); process.exit(1)}).finally(()=>prisma.$disconnect());
