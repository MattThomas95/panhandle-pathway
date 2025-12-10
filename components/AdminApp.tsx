"use client";

import { useEffect, useState } from "react";
import { Admin, Resource } from "react-admin";
import { BrowserRouter } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import { ProductList } from "./admin/ProductList";
import { ProductEdit } from "./admin/ProductEdit";
import { ProductCreate } from "./admin/ProductCreate";
import { OrganizationList } from "./admin/OrganizationList";
import { OrganizationEdit } from "./admin/OrganizationEdit";
import { OrganizationCreate } from "./admin/OrganizationCreate";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabaseClient = createClient(supabaseUrl, supabaseKey);

// Custom data provider using Supabase
const dataProvider = {
  getList: async (resource: string, params: any) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    let query = supabaseClient
      .from(resource)
      .select("*", { count: "exact" })
      .order(field, { ascending: order === "ASC" })
      .range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;
    
    return { data: data || [], total: count || 0 };
  },

  getOne: async (resource: string, params: any) => {
    const { data, error } = await supabaseClient
      .from(resource)
      .select("*")
      .eq("id", params.id)
      .single();
    if (error) throw error;
    return { data };
  },

  create: async (resource: string, params: any) => {
    const { data, error } = await supabaseClient
      .from(resource)
      .insert(params.data)
      .select()
      .single();
    if (error) throw error;
    return { data };
  },

  update: async (resource: string, params: any) => {
    const { data, error } = await supabaseClient
      .from(resource)
      .update(params.data)
      .eq("id", params.id)
      .select()
      .single();
    if (error) throw error;
    return { data };
  },

  delete: async (resource: string, params: any) => {
    const { data, error } = await supabaseClient
      .from(resource)
      .delete()
      .eq("id", params.id)
      .select()
      .single();
    if (error) throw error;
    return { data };
  },

  deleteMany: async (resource: string, params: any) => {
    const { error } = await supabaseClient
      .from(resource)
      .delete()
      .in("id", params.ids);
    if (error) throw error;
    return { data: params.ids };
  },

  getMany: async (resource: string, params: any) => {
    const { data, error } = await supabaseClient
      .from(resource)
      .select("*")
      .in("id", params.ids);
    if (error) throw error;
    return { data: data || [] };
  },

  getManyReference: async (resource: string, params: any) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    const { data, error, count } = await supabaseClient
      .from(resource)
      .select("*", { count: "exact" })
      .eq(params.target, params.id)
      .order(field, { ascending: order === "ASC" })
      .range(from, to);
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  },
};

// Custom auth provider using Supabase Auth
const authProvider = {
  login: async ({ username, password }: { username: string; password: string }) => {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: username,
      password: password,
    });
    if (error) {
      console.error("Login error:", error);
      throw new Error(error.message);
    }
    return data;
  },

  logout: async () => {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
  },

  checkAuth: async () => {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) {
      throw new Error("Not authenticated");
    }
    return session;
  },

  checkError: async (error: any) => {
    if (error?.status === 401 || error?.status === 403) {
      throw new Error("Unauthorized");
    }
  },

  getIdentity: async () => {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    return {
      id: user.id,
      fullName: user.email,
      avatar: undefined,
    };
  },

  getPermissions: async () => {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return null;
    
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    
    return profile?.role || "user";
  },
};

export default function AdminApp() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <BrowserRouter basename="/admin">
      <Admin dataProvider={dataProvider} authProvider={authProvider}>
        <Resource
          name="products"
          list={ProductList}
          edit={ProductEdit}
          create={ProductCreate}
        />
        <Resource
          name="organizations"
          list={OrganizationList}
          edit={OrganizationEdit}
          create={OrganizationCreate}
        />
      </Admin>
    </BrowserRouter>
  );
}
