import { auth } from "@/auth";
import connectDb from "@/lib/db";
import { User } from "@/models/user.model";
import { div } from "motion/react-client";
import { redirect } from "next/navigation";
import Image from "next/image";
import EditRoleMobile from "@/Components/EditRoleMobile";
import Nav from "@/Components/Nav";

export default async function Home() {
  await connectDb();
  const session = await auth();
  const user = await User.findOne({ email: session?.user?.email });
  if (!user) {
    redirect("/login");
  }
  const incomplete = !user.role || !user.mobile || (!user.mobile && user.role === "user");
  if (incomplete) {
    return <EditRoleMobile />;
  }
  const plainUser = JSON.parse(JSON.stringify(user));
  return (
    <div>
      <Nav user={plainUser} />
    </div>
  );
}
