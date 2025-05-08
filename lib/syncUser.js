// utils/syncUser.js
import { db } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function syncUserWithDB() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const existingUser = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!existingUser) {
    // Clerk se user details le lo
    const clerkUser = await clerkClient.users.getUser(userId);

    // DB me user create karo
    await db.user.create({
      data: {
        clerkUserId: userId,
        email: clerkUser.emailAddresses[0].emailAddress,
        name: clerkUser.firstName || "No Name",
      },
    });
  }
}
