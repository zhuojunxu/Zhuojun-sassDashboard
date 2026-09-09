"use client";

import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../../lib/firebase";

type Role = "admin" | "viewer";
type ProductStatus = "active" | "inactive";

interface FirestoreTimestamp {
  _seconds?: number;
  seconds?: number;
  _nanoseconds?: number;
  nanoseconds?: number;
}

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  status: ProductStatus;
  createdBy?: string;
  createdAt?: FirestoreTimestamp;
  updatedAt?: FirestoreTimestamp;
}

interface ProductForm {
  name: string;
  category: string;
  price: string;
  status: ProductStatus;
}

const emptyForm: ProductForm = {
  name: "",
  category: "",
  price: "",
  status: "active",
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<"all" | ProductStatus>(
    "all",
  );

  const [sortBy, setSortBy] = useState<
    | "Sort By name (A-Z)"
    | "Sort By Price (Low->High)"
    | "Sort By Price (High->Low)"
  >("Sort By name (A-Z)");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Firebase session -> load role + products
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        window.location.href = "/login";
        return;
      }

      setUser(firebaseUser);

      try {
        const token = await firebaseUser.getIdToken();

        const meResponse = await fetch(`${API_URL}/api/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!meResponse.ok) {
          throw new Error("Unable to load user");
        }

        const me = await meResponse.json();
        setRole(me.role);

        const productResponse = await fetch(`${API_URL}/api/products`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!productResponse.ok) {
          throw new Error("Unable to load products");
        }

        setProducts(await productResponse.json());
      } catch (err) {
        console.error(err);
        setError("Unable to load dashboard");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [API_URL]);

  function formatTimestamp(timestamp?: FirestoreTimestamp) {
    if (!timestamp) return "-";

    const seconds = timestamp._seconds ?? timestamp.seconds;

    if (seconds === undefined) return "-";

    return new Date(seconds * 1000).toLocaleString();
  }

  async function request(path: string, options: RequestInit = {}) {
    if (!user) {
      throw new Error("Not authenticated");
    }

    const token = await user.getIdToken();

    return fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
  }

  async function refreshProducts() {
    const response = await request("/api/products");

    if (!response.ok) {
      throw new Error("Unable to load products");
    }

    setProducts(await response.json());
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const payload = {
      name: form.name,
      category: form.category,
      price: Number(form.price),
      status: form.status,
    };

    try {
      const response = editingId
        ? await request(`/api/products/${editingId}`, {
            method: "PATCH",
            body: JSON.stringify(payload),
          })
        : await request("/api/products", {
            method: "POST",
            body: JSON.stringify(payload),
          });

      if (!response.ok) {
        throw new Error(
          editingId ? "Unable to update product" : "Unable to create product",
        );
      }

      setForm(emptyForm);
      setEditingId(null);
      await refreshProducts();
    } catch (err) {
      console.error(err);
      setError("Product operation failed");
    }
  }

  function startEdit(product: Product) {
    setEditingId(product.id);

    setForm({
      name: product.name,
      category: product.category,
      price: String(product.price),
      status: product.status,
    });
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this product?")) {
      return;
    }

    try {
      const response = await request(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Unable to delete product");
      }

      await refreshProducts();
    } catch (err) {
      console.error(err);
      setError("Unable to delete product");
    }
  }

  const displayedProducts = useMemo(() => {
    let result = [...products];

    if (statusFilter !== "all") {
      result = result.filter((product) => product.status === statusFilter);
    }

    if (sortBy === "Sort By name (A-Z)") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    if (sortBy === "Sort By Price (Low->High)") {
      result.sort((a, b) => a.price - b.price);
    }

    if (sortBy === "Sort By Price (High->Low)") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [products, statusFilter, sortBy]);

  const totalProducts = products.length;

  const activeProducts = products.filter(
    (product) => product.status === "active",
  ).length;

  if (loading) {
    return <main className="p-8">Loading...</main>;
  }

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Product Dashboard</h1>

        <p className="mt-1 text-gray-600">
          Signed in as {user?.email} ({role})
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded bg-red-100 p-3 text-red-700">{error}</div>
      )}

      {/* Summary metrics */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded border p-4">
          <p className="text-sm text-gray-500">Total Products</p>
          <p className="text-3xl font-bold">{totalProducts}</p>
        </div>

        <div className="rounded border p-4">
          <p className="text-sm text-gray-500">Active Products</p>
          <p className="text-3xl font-bold">{activeProducts}</p>
        </div>
      </div>

      {/* Admin-only create/edit form */}
      {role === "admin" && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 grid gap-3 rounded border p-4 md:grid-cols-5"
        >
          <input
            required
            className="rounded border p-2"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            required
            className="rounded border p-2"
            placeholder="Category"
            value={form.category}
            onChange={(e) =>
              setForm({
                ...form,
                category: e.target.value,
              })
            }
          />

          <input
            required
            min="0"
            step="0.01"
            type="number"
            className="rounded border p-2"
            placeholder="Price"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />

          <select
            className="rounded border p-2"
            value={form.status}
            onChange={(e) =>
              setForm({
                ...form,
                status: e.target.value as ProductStatus,
              })
            }
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <button
            type="submit"
            className="rounded bg-blue-600 px-4 py-2 text-white"
          >
            {editingId ? "Save Changes" : "Add Product"}
          </button>

          {editingId && (
            <button
              type="button"
              className="rounded border px-4 py-2"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
            >
              Cancel
            </button>
          )}
        </form>
      )}

      {/* Filtering / sorting */}
      <div className="mb-4 flex flex-wrap gap-3">
        <p>Status: </p>
        <select
          className="rounded border p-2"
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as "all" | ProductStatus)
          }
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <p>Sort by: </p>
        <select
          className="rounded border p-2"
          value={sortBy}
          onChange={(e) =>
            setSortBy(
              e.target.value as
                | "Sort By name (A-Z)"
                | "Sort By Price (Low->High)"
                | "Sort By Price (Low->High)",
            )
          }
        >
          <option value="Sort By name (A-Z)">Name (A-Z)</option>
          <option value="Sort By Price (Low->High)">Price (Low to High)</option>
          <option value="Sort By Price (High->Low)">Price (High to Low)</option>
        </select>
      </div>

      {/* Product list */}
      <div className="overflow-x-auto rounded border">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Created At</th>
              <th className="p-3 text-left">Updated At</th>
              {role === "admin" && <th className="p-3 text-left">Actions</th>}
            </tr>
          </thead>

          <tbody>
            {displayedProducts.map((product) => (
              <tr key={product.id} className="border-t">
                <td className="p-3">{product.name}</td>
                <td className="p-3">{product.category}</td>
                <td className="p-3">${product.price.toFixed(2)}</td>
                <td className="p-3">{product.status}</td>
                <td className="p-3">{formatTimestamp(product.createdAt)}</td>
                <td className="p-3">{formatTimestamp(product.updatedAt)}</td>
                {role === "admin" && (
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        className="rounded border px-3 py-1"
                        onClick={() => startEdit(product)}
                      >
                        Edit
                      </button>

                      <button
                        className="rounded border px-3 py-1"
                        onClick={() => handleDelete(product.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}

            {displayedProducts.length === 0 && (
              <tr>
                <td
                  colSpan={role === "admin" ? 7 : 6}
                  className="p-6 text-center text-gray-500"
                >
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
