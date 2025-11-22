import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { registerSchema } from '@/lib/validations';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validation
    const validated = registerSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ error: validated.error.flatten() }, { status: 400 });
    }

    const { name, email, password } = validated.data;

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 400 });
    }

    // Hasher le mot de passe
    const hashedPassword = await hashPassword(password);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Créer les catégories par défaut
    const defaultCategories = [
      { name: 'Logement', icon: 'Home', color: '#3B82F6' },
      { name: 'Transport', icon: 'Car', color: '#10B981' },
      { name: 'Alimentation', icon: 'UtensilsCrossed', color: '#F59E0B' },
      { name: 'Loisirs', icon: 'Gamepad2', color: '#8B5CF6' },
      { name: 'Abonnements', icon: 'Repeat', color: '#EC4899' },
      { name: 'Santé', icon: 'Heart', color: '#EF4444' },
      { name: 'Autres', icon: 'MoreHorizontal', color: '#6B7280' },
    ];

    await prisma.category.createMany({
      data: defaultCategories.map((cat) => ({
        ...cat,
        userId: user.id,
        isDefault: true,
      })),
    });

    return NextResponse.json(
      {
        message: 'Compte créé avec succès',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error during registration:', error);
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 });
  }
}

