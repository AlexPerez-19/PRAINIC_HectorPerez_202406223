const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

async function main() {
  const filePath = path.join(__dirname, 'profesores_cursos.csv');

  if (!fs.existsSync(filePath)) {
    console.error("⚠️ No se encontró el archivo profesores_cursos.csv en prisma/");
    process.exit(1);
  }

  console.log("📥 Importando datos desde CSV...");

  const cursos = [];
  const profesores = [];

  await new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        if (row.curso && row.codigo) {
          cursos.push({ code: row.codigo, name: row.curso, credits: parseInt(row.creditos || "0") });
        }
        if (row.profesor) {
          const partes = row.profesor.split(" ");
          profesores.push({ firstName: partes[0], lastName: partes.slice(1).join(" ") });
        }
      })
      .on('end', resolve)
      .on('error', reject);
  });

  // Insertar sin duplicar
  for (const c of cursos) {
    await prisma.course.upsert({
      where: { code: c.code },
      update: {},
      create: c,
    });
  }

  for (const p of profesores) {
    await prisma.professor.createMany({
      data: [p],
      skipDuplicates: true,
    });
  }

  console.log("✅ Datos importados correctamente!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
