"use client";

import { useEffect, useState } from "react";
import { Admin, Resource } from "react-admin";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { supabase as supabaseClient, supabaseJsClient } from "@/lib/supabase";
import { Dashboard } from "./admin/Dashboard";
import { RevenuePage } from "./admin/RevenuePage";
import { ProductList } from "./admin/ProductList";
import { ProductEdit } from "./admin/ProductEdit";
import { ProductCreate } from "./admin/ProductCreate";
import { OrganizationList } from "./admin/OrganizationList";
import { OrganizationEdit } from "./admin/OrganizationEdit";
import { OrganizationCreate } from "./admin/OrganizationCreate";
import { ProfileList } from "./admin/ProfileList";
import { ProfileEdit } from "./admin/ProfileEdit";
import { ProfileCreate } from "./admin/ProfileCreate";
import { ServiceList } from "./admin/ServiceList";
import { ServiceEdit } from "./admin/ServiceEdit";
import { ServiceCreate } from "./admin/ServiceCreate";
import { BookingList } from "./admin/BookingList";
import { BookingEdit } from "./admin/BookingEdit";
import { TimeSlotList } from "./admin/TimeSlotList";
import { TimeSlotEdit } from "./admin/TimeSlotEdit";
import { TimeSlotCreate } from "./admin/TimeSlotCreate";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Create custom data provider that uses Supabase client methods directly
// This ensures JWT token is automatically included in all requests
const createDataProvider = (client: any) => {
  return {
    getList: async (resource: string, params: any) => {
      const { page, perPage } = params.pagination;
      const { field, order } = params.sort;
      const from = (page - 1) * perPage;
      const to = page * perPage - 1;

      console.log(`getList ${resource}:`, { from, to, field, order });

      const query = client
        .from(resource)
        .select('*', { count: 'exact' })
        .range(from, to)
        .order(field, { ascending: order === 'ASC' });

      const { data, error, count } = await query;

      if (error) {
        console.error(`getList ${resource} error:`, error);
        throw error;
      }

      console.log(`getList ${resource} success:`, { count, dataLength: data?.length });

      return {
        data: data || [],
        total: count || 0,
      };
    },

    getOne: async (resource: string, params: any) => {
      const { data, error } = await client
        .from(resource)
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;
      return { data };
    },

    getMany: async (resource: string, params: any) => {
      const { data, error } = await client
        .from(resource)
        .select('*')
        .in('id', params.ids);

      if (error) throw error;
      return { data };
    },

    getManyReference: async (resource: string, params: any) => {
      const { page, perPage } = params.pagination;
      const { field, order } = params.sort;
      const from = (page - 1) * perPage;
      const to = page * perPage - 1;

      const { data, error, count } = await client
        .from(resource)
        .select('*', { count: 'exact' })
        .eq(params.target, params.id)
        .range(from, to)
        .order(field, { ascending: order === 'ASC' });

      if (error) throw error;

      return {
        data: data || [],
        total: count || 0,
      };
    },

    create: async (resource: string, params: any) => {
      console.log(`Creating ${resource}`, params.data);

      // Get authenticated user from JWT token
      const { data: { user }, error: userError } = await client.auth.getUser();
      console.log('CREATE DIAGNOSTIC:', {
        hasUser: !!user,
        userId: user?.id,
        userEmail: user?.email,
        userError: userError?.message
      });

      if (!user) {
        throw new Error('Not authenticated - no user found');
      }

      // Special handling for profiles - create auth user first
      if (resource === "profiles") {
        const { email, password, full_name, role, is_org_admin, organization_id } = params.data;

        const { data: authData, error: authError } = await supabaseClient.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name,
            },
          },
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error("Failed to create user");

        await new Promise(resolve => setTimeout(resolve, 1000));

        const { data, error} = await supabaseClient
          .from("profiles")
          .update({
            full_name,
            role: role || "user",
            is_org_admin: is_org_admin || false,
            organization_id: organization_id || null,
          })
          .eq("id", authData.user.id)
          .select()
          .single();

        if (error) throw error;
        return { data };
      }

      // DIAGNOSTIC: Test direct fetch to see if it's an RLS or client issue
      const { data: { session: testSession } } = await client.auth.getSession();

      // Decode JWT to see what role it has
      let jwtPayload = null;
      if (testSession?.access_token) {
        try {
          const parts = testSession.access_token.split('.');
          jwtPayload = JSON.parse(atob(parts[1]));
          console.log('JWT Payload:', {
            role: jwtPayload.role,
            sub: jwtPayload.sub,
            email: jwtPayload.email,
            exp: new Date(jwtPayload.exp * 1000),
            aud: jwtPayload.aud
          });
        } catch (e) {
          console.error('Failed to decode JWT:', e);
        }
      }

      console.log('About to insert - session check:', {
        hasSession: !!testSession,
        hasToken: !!testSession?.access_token,
        tokenStart: testSession?.access_token?.substring(0, 30),
        jwtRole: jwtPayload?.role
      });

      // Try manual fetch to verify the token is sent correctly
      try {
        const manualUrl = `${supabaseUrl}/rest/v1/${resource}`;
        console.log('Trying manual fetch to:', manualUrl);

        const manualResponse = await fetch(manualUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${testSession?.access_token}`,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(params.data)
        });

        console.log('Manual fetch response:', {
          status: manualResponse.status,
          ok: manualResponse.ok
        });

        if (manualResponse.ok) {
          const manualData = await manualResponse.json();
          console.log('Manual fetch SUCCESS!', manualData);
          return { data: Array.isArray(manualData) ? manualData[0] : manualData };
        } else {
          const manualError = await manualResponse.json();
          console.error('Manual fetch FAILED:', manualError);
        }
      } catch (fetchError) {
        console.error('Manual fetch exception:', fetchError);
      }

      // Also try with Supabase client
      const { data, error } = await client
        .from(resource)
        .insert(params.data)
        .select()
        .single();

      if (error) {
        console.error(`Create ${resource} error:`, error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      console.log(`Create ${resource} success:`, data);
      return { data };
    },

    update: async (resource: string, params: any) => {
      const { data, error } = await client
        .from(resource)
        .update(params.data)
        .eq('id', params.id)
        .select()
        .single();

      if (error) throw error;
      return { data };
    },

    updateMany: async (resource: string, params: any) => {
      const { data, error } = await client
        .from(resource)
        .update(params.data)
        .in('id', params.ids)
        .select();

      if (error) throw error;
      return { data: params.ids };
    },

    delete: async (resource: string, params: any) => {
      const { data, error } = await client
        .from(resource)
        .delete()
        .eq('id', params.id)
        .select()
        .single();

      if (error) throw error;
      return { data };
    },

    deleteMany: async (resource: string, params: any) => {
      const { error } = await client
        .from(resource)
        .delete()
        .in('id', params.ids);

      if (error) throw error;
      return { data: params.ids };
    },
  };
};

// Custom auth provider using Supabase Auth
const authProvider = {
  login: async ({ username, password }: { username: string; password: string }) => {
    // Redirect to custom login page instead of handling login here
    window.location.href = '/auth/login';
    return Promise.reject();
  },

  logout: async () => {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
    // Redirect to custom login after logout
    window.location.href = '/auth/login';
  },

  checkAuth: async () => {
    const { data: { session } } = await supabaseJsClient.auth.getSession();
    console.log('React Admin checkAuth:', { hasSession: !!session });
    if (!session) {
      return Promise.reject(new Error('Not authenticated'));
    }
    return Promise.resolve();
  },

  checkError: async (error: any) => {
    console.log('React Admin checkError:', error);
    const status = error?.status;
    if (status === 401 || status === 403) {
      return Promise.reject(new Error('Unauthorized'));
    }
    return Promise.resolve();
  },

  getIdentity: async () => {
    const { data: { user } } = await supabaseJsClient.auth.getUser();
    if (!user) {
      return Promise.reject(new Error('Not authenticated'));
    }
    return {
      id: user.id,
      fullName: user.email,
      avatar: undefined,
    };
  },

  getPermissions: async () => {
    const { data: { user } } = await supabaseJsClient.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabaseJsClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    return profile?.role || "user";
  },
};

export default function AdminApp() {
  const [isClient, setIsClient] = useState(false);
  const [dataProvider, setDataProvider] = useState<any>(null);

  useEffect(() => {
    // Transfer session from SSR client to JS client for proper Authorization headers
    const initDataProvider = async () => {
      const { data: { session } } = await supabaseClient.auth.getSession();
      console.log('Initializing data provider:', {
        hasSession: !!session,
        accessToken: session?.access_token ? 'present' : 'missing',
        userId: session?.user?.id
      });

      if (session) {
        // Transfer session to JS client which properly sends Authorization headers
        await supabaseJsClient.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        });

        // Verify the JS client has the user
        const { data: { user } } = await supabaseJsClient.auth.getUser();
        console.log('JS client user verified:', { hasUser: !!user, userId: user?.id });

        // Use JS client for data provider - it sends proper Authorization headers
        setDataProvider(createDataProvider(supabaseJsClient));
        console.log('Data provider initialized with JS client');
      } else {
        console.error('No session found in cookies!');
      }

      setIsClient(true);
    };

    initDataProvider();
  }, []);

  if (!isClient || !dataProvider) return null;

  return (
    <BrowserRouter basename="/admin">
      <Admin
        dataProvider={dataProvider}
        authProvider={authProvider}
        loginPage={false}
        requireAuth
        dashboard={Dashboard}
      >
        <Routes>
          <Route path="/revenue" element={<RevenuePage />} />
          <Route
            path="/"
            element={
              <>
                <Resource
                  name="profiles"
                  list={ProfileList}
                  edit={ProfileEdit}
                  create={ProfileCreate}
                  options={{ label: "Users" }}
                />
                <Resource
                  name="organizations"
                  list={OrganizationList}
                  edit={OrganizationEdit}
                  create={OrganizationCreate}
                />
                <Resource
                  name="products"
                  list={ProductList}
                  edit={ProductEdit}
                  create={ProductCreate}
                />
                <Resource
                  name="services"
                  list={ServiceList}
                  edit={ServiceEdit}
                  create={ServiceCreate}
                />
                <Resource
                  name="bookings"
                  list={BookingList}
                  edit={BookingEdit}
                />
                <Resource
                  name="time_slots"
                  list={TimeSlotList}
                  edit={TimeSlotEdit}
                  create={TimeSlotCreate}
                  options={{ label: "Time Slots" }}
                />
              </>
            }
          />
        </Routes>
      </Admin>
    </BrowserRouter>
  );
}
