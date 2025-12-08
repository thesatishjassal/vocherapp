// app/quotation/[quote]/page.js (or your dynamic route file) - Server Component (async allowed)
import ClientViewQuotation from "../../components/ViewQuotationClient"; // Adjust path as needed

export default async function ViewQuotationPage({ params }) {
  const { quote } = await params; // Await params Promise in Server Component
  console.log("Quote param:", quote);

  return <ClientViewQuotation quote={quote} />;
}