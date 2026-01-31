"use client";

import { useCallback, useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import {
  Building2,
  Users,
  Settings,
  UserPlus,
  LogOut,
  Loader2,
  Trash2,
  ShieldCheck,
} from "lucide-react";

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

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*, organizations(*)")
      .eq("id", session.user.id)
      .single();

    if (!profileData?.is_org_admin || !profileData?.organization_id) {
      router.push("/dashboard");
      return;
    }

    setOrganization(profileData.organizations);
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
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  const tabs = [
    { key: "members" as const, label: `Members (${members.length})`, icon: Users },
    { key: "invite" as const, label: "Invite members", icon: UserPlus },
    { key: "settings" as const, label: "Settings", icon: Settings },
  ];

  return (
    <div className="page-container">
      <PageHeader
        badge="Organization portal"
        badgeVariant="blue"
        title={organization?.name || "Organization"}
        description="Manage your organization members and settings."
      >
        <Button variant="secondary" size="sm" asChild>
          <Link href="/dashboard">Dashboard</Link>
        </Button>
        <Button variant="ghost" size="sm" onClick={handleSignOut}>
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </PageHeader>

      {/* Tabs */}
      <div className="mb-8 border-b border-[var(--border)]">
        <nav className="-mb-px flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-bold transition-colors cursor-pointer ${
                activeTab === tab.key
                  ? "border-[var(--primary)] text-[var(--primary)]"
                  : "border-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

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
  );
}

function MembersTab({
  members,
  currentUserId,
  onUpdate,
}: {
  members: Profile[];
  currentUserId: string;
  onUpdate: () => void;
}) {
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const toggleOrgAdmin = async (memberId: string, currentStatus: boolean) => {
    if (memberId === currentUserId) return;
    const { error } = await supabase.from("profiles").update({ is_org_admin: !currentStatus }).eq("id", memberId);
    if (!error) onUpdate();
  };

  const removeMember = async (memberId: string) => {
    if (memberId === currentUserId) return;
    if (!confirm("Are you sure you want to remove this member from the organization?")) return;
    const { error } = await supabase.from("profiles").update({ organization_id: null, is_org_admin: false }).eq("id", memberId);
    if (!error) onUpdate();
  };

  return (
    <Card variant="default" className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">Member</th>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">Role</th>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">Org admin</th>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">Joined</th>
              <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-light)]">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-[var(--surface)] transition-colors">
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="font-bold text-[var(--foreground)]">{member.full_name || "—"}</div>
                  <div className="text-sm text-[var(--foreground-muted)]">{member.email}</div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <Badge variant={member.role === "admin" ? "blue" : "default"}>{member.role}</Badge>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <button
                    onClick={() => toggleOrgAdmin(member.id, member.is_org_admin)}
                    disabled={member.id === currentUserId}
                    className={`cursor-pointer ${member.id === currentUserId ? "cursor-not-allowed opacity-50" : ""}`}
                  >
                    <Badge variant={member.is_org_admin ? "success" : "default"}>
                      {member.is_org_admin ? "Yes" : "No"}
                    </Badge>
                  </button>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-[var(--foreground-muted)]">
                  {new Date(member.created_at).toLocaleDateString()}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right">
                  {member.id !== currentUserId ? (
                    <Button variant="ghost" size="sm" onClick={() => removeMember(member.id)} className="text-[var(--error)] hover:text-[var(--error)] hover:bg-[var(--rose-50)]">
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </Button>
                  ) : (
                    <Badge variant="outline">You</Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function InviteTab({
  organizationId,
  onInvited,
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

  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const inputClass =
    "w-full rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-[var(--foreground)] shadow-sm focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-colors";
  const labelClass = "block text-sm font-bold text-[var(--foreground)] mb-1.5";

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (authError) { setMessage({ type: "error", text: authError.message }); setLoading(false); return; }
    if (!authData.user) { setMessage({ type: "error", text: "Failed to create user" }); setLoading(false); return; }

    await new Promise(resolve => setTimeout(resolve, 1000));

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ organization_id: organizationId, full_name: fullName })
      .eq("id", authData.user.id);

    if (updateError) {
      setMessage({ type: "error", text: `User created but failed to add to org: ${updateError.message}` });
    } else {
      setMessage({ type: "success", text: `Created account for ${email} and added to organization!` });
      setEmail(""); setPassword(""); setFullName("");
      onInvited();
    }
    setLoading(false);
  };

  const handleAddExisting = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { data: existingProfile } = await supabase.from("profiles").select("id, organization_id").eq("email", email).single();

    if (!existingProfile) {
      setMessage({ type: "error", text: "No user found with this email. Try creating a new account instead." });
      setLoading(false); return;
    }
    if (existingProfile.organization_id) {
      setMessage({ type: "error", text: "This user is already part of an organization." });
      setLoading(false); return;
    }

    const { error } = await supabase.from("profiles").update({ organization_id: organizationId }).eq("id", existingProfile.id);

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
    <Card variant="default" className="max-w-lg p-6">
      <div className="flex gap-2 mb-6">
        <Button
          variant={mode === "create" ? "primary" : "secondary"}
          size="sm"
          onClick={() => { setMode("create"); setMessage(null); }}
        >
          Create new user
        </Button>
        <Button
          variant={mode === "existing" ? "primary" : "secondary"}
          size="sm"
          onClick={() => { setMode("existing"); setMessage(null); }}
        >
          Add existing user
        </Button>
      </div>

      {message && (
        <div className={`rounded-xl p-3 text-sm font-medium mb-4 ${
          message.type === "success"
            ? "bg-[var(--teal-50)] text-[var(--teal-600)]"
            : "bg-[var(--rose-50)] text-[var(--error)]"
        }`}>
          {message.text}
        </div>
      )}

      {mode === "create" ? (
        <>
          <h3 className="text-base mb-1">Create new member account</h3>
          <p className="text-sm text-[var(--foreground-muted)] mb-4">
            Create a new account that will automatically be added to your organization.
          </p>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className={labelClass}>Full name</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className={inputClass} placeholder="John Doe" />
            </div>
            <div>
              <label className={labelClass}>Email address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} placeholder="user@example.com" />
            </div>
            <div>
              <label className={labelClass}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className={inputClass} placeholder="Minimum 6 characters" />
            </div>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Creating..." : "Create account"}
            </Button>
          </form>
        </>
      ) : (
        <>
          <h3 className="text-base mb-1">Add existing user</h3>
          <p className="text-sm text-[var(--foreground-muted)] mb-4">
            Add a user who already has an account to your organization.
          </p>
          <form onSubmit={handleAddExisting} className="space-y-4">
            <div>
              <label className={labelClass}>Email address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} placeholder="user@example.com" />
            </div>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Adding..." : "Add to organization"}
            </Button>
          </form>
        </>
      )}
    </Card>
  );
}

function SettingsTab({
  organization,
  onUpdate,
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

  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const inputClass =
    "w-full rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-[var(--foreground)] shadow-sm focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-colors";
  const labelClass = "block text-sm font-bold text-[var(--foreground)] mb-1.5";

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
    <Card variant="default" className="max-w-lg p-6">
      <h3 className="text-base mb-4">Organization settings</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {message && (
          <div className={`rounded-xl p-3 text-sm font-medium ${
            message.type === "success"
              ? "bg-[var(--teal-50)] text-[var(--teal-600)]"
              : "bg-[var(--rose-50)] text-[var(--error)]"
          }`}>
            {message.text}
          </div>
        )}

        <div>
          <label className={labelClass}>Organization name</label>
          <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Contact email</label>
          <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Phone</label>
          <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Address</label>
          <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} rows={3} className={inputClass} />
        </div>

        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? "Saving..." : "Save changes"}
        </Button>
      </form>
    </Card>
  );
}
