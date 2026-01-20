// app/quotation/[quote]/page.js (or your dynamic route file) - Server Component (async allowed)
import ViewSwitchQuotation from "../../components/ViewSwitchQuotation"; // Adjust path as needed

export default async function ViewSwitchQuotationPage({ params }) {
  const { quote } = await params; // Await params Promise in Server Component
  console.log("Quote param:", quote);

  return <ViewSwitchQuotation quote={quote} />;
}