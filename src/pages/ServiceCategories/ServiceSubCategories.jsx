import { useParams, Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import ServiceSubCategoriesTable from "../../components/service-categories/ServiceSubCategoriesTable";
import { useBreadcrumb } from "../../context/BreadcrumbContext";

export default function ServiceSubCategories() {
  const { categoryId } = useParams();

  // In a real app, you would fetch the category name based on categoryId
  // Dummy mapping for now based on the screenshot setup
  const getCategoryName = (id) => {
    switch(id) {
      case "1": return "Domestic / General Cleaning";
      case "2": return "Commercial Cleaning";
      case "3": return "Other Categories";
      case "4": return "Bond / End-of-Lease Cleaning";
      default: return "Domestic / General Cleaning";
    }
  };

  const categoryName = getCategoryName(categoryId);
  const { setExtraCrumbs } = useBreadcrumb();

  useEffect(() => {
    setExtraCrumbs([
      { label: categoryName, path: `/service-categories/${categoryId}` }
    ]);
    return () => setExtraCrumbs([]);
  }, [categoryName, categoryId, setExtraCrumbs]);

  return (
    <div className="">
      <div className="mb-6 flex items-center gap-2">
        <Link 
          to="/service-categories" 
          className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </Link>
        <h1 className="text-2xl font-bold text-[#1F2937]">{categoryName}</h1>
      </div>

      <ServiceSubCategoriesTable categoryName={categoryName} />
    </div>
  );
}
