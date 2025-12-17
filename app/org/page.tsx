"use client";

import { useCallback, useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";

const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  is_org_admin: boolean;
  created_at: string;
};

type Organization = {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  phone: string | null;
  address: string | null;
};

export default function OrgPortalPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"members" | "settings" | "invite">("members");

  const fetchMembers = useCallback(async (orgId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false });

    setMembers(data || []);
  }, []);

  const checkAccess = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push("/auth/login");
      return;
    }

    setUser(session.user);

    // Fetch profile with organization
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*, organizations(*)")
      .eq("id", session.user.id)
      .single();

    if (!profileData?.is_org_admin || !profileData?.organization_id) {
      // Not an org admin, redirect to dashboard
      router.push("/dashboard");
      return;
    }

    setOrganization(profileData.organizations);

    // Fetch organization members
    await fetchMembers(profileData.organization_id);
    setLoading(false);
  }, [fetchMembers, router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkAccess();
  }, [checkAccess]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="text-zinc-600 dark:text-zinc-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold text-black dark:text-white">
              Panhandle Pathway
            </Link>
            <span className="rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              Organization Portal
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {organization?.name}
            </span>
            <Link
              href="/dashboard"
              className="text-sm text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white"
            >
              Dashboard
            </Link>
            <button
              onClick={handleSignOut}
              className="rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black dark:text-white">
            {organization?.name}
          </h1>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">
            Manage your organization members and settings
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-zinc-200 dark:border-zinc-800">
          <nav className="-mb-px flex gap-6">
            <button
              onClick={() => setActiveTab("members")}
              className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
                activeTab === "members"
                  ? "border-black text-black dark:border-white dark:text-white"
                  : "border-transparent text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white"
              }`}
            >
              Members ({members.length})
            </button>
            <button
              onClick={() => setActiveTab("invite")}
              className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
                activeTab === "invite"
                  ? "border-black text-black dark:border-white dark:text-white"
                  : "border-transparent text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white"
              }`}
            >
              Invite Members
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
                activeTab === "settings"
                  ? "border-black text-black dark:border-white dark:text-white"
                  : "border-transparent text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white"
              }`}
            >
              Settings
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "members" && (
          <MembersTab members={members} currentUserId={user?.id} onUpdate={() => fetchMembers(organization!.id)} />
        )}
        {activeTab === "invite" && (
          <InviteTab organizationId={organization!.id} onInvited={() => fetchMembers(organization!.id)} />
        )}
        {activeTab === "settings" && (
          <SettingsTab organization={organization!} onUpdate={setOrganization} />
        )}
      </div>
    </div>
  );
}

// Members Tab Component
function MembersTab({ 
  members, 
  currentUserId, 
  onUpdate 
}: { 
  members: Profile[]; 
  currentUserId: string;
  onUpdate: () => void;
}) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const toggleOrgAdmin = async (memberId: string, currentStatus: boolean) => {
    if (memberId === currentUserId) return; // Can't change own status
    
    const { error } = await supabase
      .from("profiles")
      .update({ is_org_admin: !currentStatus })
      .eq("id", memberId);

    if (!error) {
      onUpdate();
    }
  };

  const removeMember = async (memberId: string) => {
    if (memberId === currentUserId) return;
    
    if (!confirm("Are you sure you want to remove this member from the organization?")) {
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ organization_id: null, is_org_admin: false })
      .eq("id", memberId);

    if (!error) {
      onUpdate();
    }
  };

  return (
    <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <table className="w-full">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-800">
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Member
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Org Admin
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Joined
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {members.map((member) => (
            <tr key={member.id}>
              <td className="whitespace-nowrap px-6 py-4">
                <div>
                  <div className="font-medium text-black dark:text-white">
                    {member.full_name || "—"}
                  </div>
                  <div className="text-sm text-zinc-500 dark:text-zinc-400">
                    {member.email}
                  </div>
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                  member.role === "admin" 
                    ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                    : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                }`}>
                  {member.role}
                </span>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <button
                  onClick={() => toggleOrgAdmin(member.id, member.is_org_admin)}
                  disabled={member.id === currentUserId}
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-medium transition-colors ${
                    member.is_org_admin
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                  } ${member.id === currentUserId ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:opacity-80"}`}
                >
                  {member.is_org_admin ? "Yes" : "No"}
                </button>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                {new Date(member.created_at).toLocaleDateString()}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-right">
                {member.id !== currentUserId && (
                  <button
                    onClick={() => removeMember(member.id)}
                    className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Remove
                  </button>
                )}
                {member.id === currentUserId && (
                  <span className="text-sm text-zinc-400 dark:text-zinc-500">You</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Invite Tab Component
function InviteTab({ 
  organizationId, 
  onInvited 
}: { 
  organizationId: string;
  onInvited: () => void;
}) {
  const [mode, setMode] = useState<"existing" | "create">("create");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Create new user account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (authError) {
      setMessage({ type: "error", text: authError.message });
      setLoading(false);
      return;
    }

    if (!authData.user) {
      setMessage({ type: "error", text: "Failed to create user" });
      setLoading(false);
      return;
    }

    // Wait a moment for the trigger to create the profile
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update the profile with organization
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ 
        organization_id: organizationId,
        full_name: fullName,
      })
      .eq("id", authData.user.id);

    if (updateError) {
      setMessage({ type: "error", text: `User created but failed to add to org: ${updateError.message}` });
    } else {
      setMessage({ type: "success", text: `Created account for ${email} and added to organization!` });
      setEmail("");
      setPassword("");
      setFullName("");
      onInvited();
    }

    setLoading(false);
  };

  const handleAddExisting = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Check if user exists
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id, organization_id")
      .eq("email", email)
      .single();

    if (!existingProfile) {
      setMessage({ type: "error", text: "No user found with this email. Try creating a new account instead." });
      setLoading(false);
      return;
    }

    if (existingProfile.organization_id) {
      setMessage({ type: "error", text: "This user is already part of an organization." });
      setLoading(false);
      return;
    }

    // Add user to organization
    const { error } = await supabase
      .from("profiles")
      .update({ organization_id: organizationId })
      .eq("id", existingProfile.id);

    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "success", text: `Successfully added ${email} to your organization!` });
      setEmail("");
      onInvited();
    }

    setLoading(false);
  };

  return (
    <div className="max-w-lg rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      {/* Mode Toggle */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => { setMode("create"); setMessage(null); }}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            mode === "create"
              ? "bg-black text-white dark:bg-white dark:text-black"
              : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
          }`}
        >
          Create New User
        </button>
        <button
          onClick={() => { setMode("existing"); setMessage(null); }}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            mode === "existing"
              ? "bg-black text-white dark:bg-white dark:text-black"
              : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
          }`}
        >
          Add Existing User
        </button>
      </div>

      {message && (
        <div className={`mb-4 rounded-md p-3 text-sm ${
          message.type === "success" 
            ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
            : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
        }`}>
          {message.text}
        </div>
      )}

      {mode === "create" ? (
        <>
          <h2 className="text-lg font-semibold text-black dark:text-white">
            Create New Member Account
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Create a new account that will automatically be added to your organization.
          </p>

          <form onSubmit={handleCreateUser} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-black shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-black shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                placeholder="user@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-black shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                placeholder="Minimum 6 characters"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-black px-4 py-2 text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>
        </>
      ) : (
        <>
          <h2 className="text-lg font-semibold text-black dark:text-white">
            Add Existing User
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Add a user who already has an account to your organization.
          </p>

          <form onSubmit={handleAddExisting} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-black shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                placeholder="user@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-black px-4 py-2 text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              {loading ? "Adding..." : "Add to Organization"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

// Settings Tab Component
function SettingsTab({ 
  organization, 
  onUpdate 
}: { 
  organization: Organization;
  onUpdate: (org: Organization) => void;
}) {
  const [formData, setFormData] = useState({
    name: organization.name,
    email: organization.email || "",
    phone: organization.phone || "",
    address: organization.address || "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { data, error } = await supabase
      .from("organizations")
      .update({
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone || null,
        address: formData.address || null,
      })
      .eq("id", organization.id)
      .select()
      .single();

    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "success", text: "Organization settings updated!" });
      onUpdate(data);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-lg rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-lg font-semibold text-black dark:text-white">
        Organization Settings
      </h2>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {message && (
          <div className={`rounded-md p-3 text-sm ${
            message.type === "success" 
              ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
              : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
          }`}>
            {message.text}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Organization Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-black shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Contact Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-black shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Phone
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-black shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Address
          </label>
          <textarea
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            rows={3}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-black shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-black px-4 py-2 text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
