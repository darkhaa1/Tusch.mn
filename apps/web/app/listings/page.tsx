
import NewListings from "../components/NewListings";

type ListingsPageProps = {
  searchParams?: { category?: string | string[] };
};

export default function ListingsPage({ searchParams }: ListingsPageProps) {
  const rawCategory = searchParams?.category;
  const category = Array.isArray(rawCategory) ? rawCategory[0] : rawCategory;


  return (
    <div className="py-8">

      <NewListings category={category} />
    </div>
  );
}
