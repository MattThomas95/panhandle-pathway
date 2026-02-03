/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { Admin, Resource, defaultTheme } from "react-admin";
import { createTheme } from "@mui/material/styles";
import { supabase as supabaseClient, supabaseJsClient } from "@/lib/supabase";
import { Dashboard } from "./admin/Dashboard";
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
import { OrderList } from "./admin/OrderList";
import { OrderEdit } from "./admin/OrderEdit";
import { OrderShow } from "./admin/OrderShow";
import { BundleList } from "./admin/BundleList";
import { BundleCreate } from "./admin/BundleCreate";
import { BundleEdit } from "./admin/BundleEdit";
import { SiteSettingsList } from "./admin/SiteSettingsList";
import { SiteSettingsEdit } from "./admin/SiteSettingsEdit";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const adminTheme = createTheme({
  ...defaultTheme,
  palette: {
    mode: "light",
    primary: {
      main: "#1e7fb6",
    },
    secondary: {
      main: "#f2b705",
    },
    background: {
      default: "#f7f2e7",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: "#103b64",
          color: "#ffffff",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
    RaMenuItemLink: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          margin: "2px 6px",
        },
      },
    },
  },
});

// Create custom data provider that uses Supabase client methods directly
// This ensures JWT token is automatically included in all requests
const createDataProvider = (client: any) => {
  return {
    getList: async (resource: string, params: any) => {
      const { page, perPage } = params.pagination;
      const { field, order } = params.sort;
      const from = (page - 1) * perPage;
      const to = page * perPage - 1;
      const filters = params.filter || {};

      console.log(`getList ${resource}:`, { from, to, field, order, filters });

      // Special handling for site_settings - simple fetch
      if (resource === "site_settings") {
        try {
          // Build query
          let query = client
            .from(resource)
            .select('*');

          // Apply filters for site_settings
          Object.entries(filters).forEach(([key, value]) => {
            if (value === undefined || value === null || value === "") return;
            if (typeof value === "string") {
              query = query.ilike(key, `%${value}%`);
            } else {
              query = query.eq(key, value);
            }
          });

          // Order by category then key
          query = query.order('category', { ascending: true }).order('key', { ascending: true });

          // Get total count first
          const countResult = await client
            .from(resource)
            .select('id', { count: 'exact', head: true });

          const totalCount = countResult.count || 0;

          // Get paginated data
          const { data, error } = await query.range(from, to);

          if (error) {
            console.error(`getList ${resource} error:`, error);
            throw error;
          }

          console.log(`getList ${resource} success:`, { totalCount, dataLength: data?.length });

          return {
            data: data || [],
            total: totalCount,
          };
        } catch (err) {
          console.error(`getList ${resource} exception:`, err);
          throw err;
        }
      }

      // Special handling for bundles - fetch with services
      if (resource === "bundles") {
        const { data: bundles, error, count } = await client
          .from(resource)
          .select('*', { count: 'exact' })
          .range(from, to)
          .order(field, { ascending: order === 'ASC' });

        if (error) {
          console.error('Failed to fetch bundles:', error);
          throw error;
        }

        // Fetch services for each bundle
        const bundlesWithServices = await Promise.all(
          (bundles || []).map(async (bundle) => {
            const { data: bundleServices } = await client
              .from('bundle_services')
              .select('service_id')
              .eq('bundle_id', bundle.id);

            const serviceIds = bundleServices?.map((bs: any) => bs.service_id) || [];

            if (serviceIds.length > 0) {
              const { data: services } = await client
                .from('services')
                .select('id, name, price')
                .in('id', serviceIds);

              return {
                ...bundle,
                services: services || [],
              };
            }

            return {
              ...bundle,
              services: [],
            };
          })
        );

        return {
          data: bundlesWithServices,
          total: count || 0,
        };
      }

      let query = client
        .from(resource)
        .select('*', { count: 'exact' })
        .range(from, to)
        .order(field, { ascending: order === 'ASC' });

      // Apply filters (simple equality/ilike)
      Object.entries(filters).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") return;
        const isUuidLike = typeof value === "string" && /^[0-9a-fA-F-]{32,36}$/.test(value);
        if (typeof value === "string" && !isUuidLike) {
          query = query.ilike(key, `%${value}%`);
        } else {
          query = query.eq(key, value);
        }
      });

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
      // Special handling for site_settings - use key instead of id
      if (resource === "site_settings") {
        const { data, error } = await client
          .from(resource)
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) {
          console.error(`Failed to fetch ${resource}:`, error);
          throw error;
        }

        return { data };
      }

      // Special handling for bundles - fetch with services
      if (resource === "bundles") {
        const { data: bundle, error } = await client
          .from(resource)
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) {
          console.error('Failed to fetch bundle:', error);
          throw error;
        }

        // Fetch services for the bundle
        const { data: bundleServices } = await client
          .from('bundle_services')
          .select('service_id')
          .eq('bundle_id', bundle.id);

        const serviceIds = bundleServices?.map((bs: any) => bs.service_id) || [];

        if (serviceIds.length > 0) {
          const { data: services } = await client
            .from('services')
            .select('id, name, price')
            .in('id', serviceIds);

          return {
            data: {
              ...bundle,
              services: services || [],
              service_ids: serviceIds,
            },
          };
        }

        return {
          data: {
            ...bundle,
            services: [],
            service_ids: [],
          },
        };
      }

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
      // Get authenticated user from JWT token
      const { data: { user }, error: userError } = await client.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated - no user found');
      }

      // Special handling for bundles - create bundle and bundle_services
      if (resource === "bundles") {
        const { service_ids, ...bundleData } = params.data;

        // Validate
        if (!bundleData.name || bundleData.custom_price === undefined || !service_ids || service_ids.length < 2) {
          throw new Error('name, custom_price, and at least 2 service_ids are required');
        }

        // Create bundle using SECURITY DEFINER function
        // This validates admin role and creates bundle + bundle_services atomically
        const { data: bundle, error: bundleError } = await client
          .rpc('admin_create_bundle', {
            p_name: bundleData.name,
            p_description: bundleData.description || null,
            p_custom_price: bundleData.custom_price,
            p_late_fee_days: bundleData.late_fee_days || 0,
            p_late_fee_amount: bundleData.late_fee_amount || 0,
            p_is_active: bundleData.is_active !== false,
            p_service_ids: service_ids
          });

        if (bundleError) {
          console.error('Error creating bundle:', bundleError);
          throw new Error(bundleError.message || 'Failed to create bundle');
        }

        // Fetch services for the created bundle
        const { data: services } = await client
          .from('services')
          .select('id, name, price')
          .in('id', service_ids);

        return {
          data: {
            ...bundle,
            services: services || [],
            service_ids,
          },
        };
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
      // Special handling for bundles - update bundle and bundle_services
      if (resource === "bundles") {
        const { service_ids, services, ...bundleData } = params.data;

        // Validate
        if (!service_ids || !Array.isArray(service_ids) || service_ids.length < 2) {
          throw new Error('Bundle must have at least 2 services');
        }

        // Update bundle using SECURITY DEFINER function
        // This validates admin role and updates bundle + bundle_services atomically
        const { data: bundle, error: bundleError } = await client
          .rpc('admin_update_bundle', {
            p_bundle_id: params.id,
            p_name: bundleData.name,
            p_description: bundleData.description || null,
            p_custom_price: bundleData.custom_price,
            p_late_fee_days: bundleData.late_fee_days || 0,
            p_late_fee_amount: bundleData.late_fee_amount || 0,
            p_is_active: bundleData.is_active !== false,
            p_service_ids: service_ids
          });

        if (bundleError) {
          console.error('Error updating bundle:', bundleError);
          throw new Error(bundleError.message || 'Failed to update bundle');
        }

        // Fetch updated services
        const { data: updatedServices } = await client
          .from('services')
          .select('id, name, price')
          .in('id', service_ids);

        return {
          data: {
            ...bundle,
            services: updatedServices || [],
            service_ids,
          },
        };
      }

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
      // Special handling for bundles - use SECURITY DEFINER function
      if (resource === "bundles") {
        const { data, error } = await client
          .rpc('admin_delete_bundle', {
            p_bundle_id: params.id
          });

        if (error) {
          console.error('Failed to delete bundle:', error);
          throw new Error(error.message || 'Failed to delete bundle');
        }

        return { data: { id: params.id } };
      }

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
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Transfer session from SSR client to JS client for proper Authorization headers
    const initDataProvider = async () => {
      try {
        // Wait for any pending auth state to settle
        await new Promise(resolve => setTimeout(resolve, 200));

        // Get the session from the server-side client (which has cookies)
        const { data: { session } } = await supabaseClient.auth.getSession();
        console.log('AdminApp - Initializing data provider:', {
          hasSession: !!session,
          accessToken: session?.access_token ? 'present' : 'missing',
          userId: session?.user?.id,
          email: session?.user?.email
        });

        if (session) {
          // Transfer session to JS client which properly sends Authorization headers
          const { error: setSessionError } = await supabaseJsClient.auth.setSession({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          });

          if (setSessionError) {
            console.error('Error setting session on JS client:', setSessionError);
          } else {
            console.log('Session successfully transferred to JS client');
          }

          // Verify the JS client has the user
          const { data: { user } } = await supabaseJsClient.auth.getUser();
          console.log('JS client user verified:', { hasUser: !!user, userId: user?.id });

          // Use JS client for data provider - it sends proper Authorization headers
          setDataProvider(createDataProvider(supabaseJsClient));
          console.log('Data provider initialized with JS client');
          setIsInitialized(true);
        } else {
          console.error('No session found in AdminApp initialization!');
          setIsInitialized(true);
        }
      } catch (err) {
        console.error('Error initializing data provider:', err);
        setIsInitialized(true);
      }

      setIsClient(true);
    };

    initDataProvider();
  }, []);

  if (!isClient || !dataProvider) return null;

  return (
    <Admin
      dataProvider={dataProvider}
      theme={adminTheme}
      authProvider={authProvider}
      loginPage={false}
      requireAuth={false}
      dashboard={Dashboard}
    >
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
        name="bundles"
        list={BundleList}
        edit={BundleEdit}
        create={BundleCreate}
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
      <Resource
        name="orders"
        list={OrderList}
        edit={OrderEdit}
        show={OrderShow}
      />
      <Resource
        name="order_items"
      />
      <Resource
        name="site_settings"
        list={SiteSettingsList}
        edit={SiteSettingsEdit}
        options={{ label: "Advertised Times" }}
      />
    </Admin>
  );
}
