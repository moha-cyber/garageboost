import Link from "next/link";
import { CustomerForm } from "@/components/customers/customer-form";

export default function NewCustomerPage() { return <><div className="topline"><div><Link className="muted" href="/dashboard/customers">← Tous les clients</Link><h1 style={{ marginTop: 18 }}>Ajouter un client</h1><p className="muted">Son score de risque sera calculé automatiquement.</p></div></div><CustomerForm /></>; }
