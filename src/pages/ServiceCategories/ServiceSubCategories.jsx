import { useParams, Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import ServiceSubCategoriesTable from "../../components/service-categories/ServiceSubCategoriesTable";
import { useBreadcrumb } from "../../context/BreadcrumbContext";
import { getCategories } from "../../api/services/categoryService";

export default function ServiceSubCategories() {
  const { categoryId } = useParams();
  const location = useLocation();
  const [categoryName, setCategoryName] = useState(location.state?.categoryName || "");
  const [loading, setLoading] = useState(!location.state?.categoryName);
  const { setExtraCrumbs } = useBreadcrumb();

  useEffect(() => {
    const fetchCategoryDetails = async () => {
      // If we already have the name from state, no need to fetch
      if (categoryName && categoryName !== "Category") {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getCategories();
        // Check if response has data property (array) or is an array itself
        const categoriesList = response.data || (Array.isArray(response) ? response : []);
        const currentCategory = categoriesList.find(cat => cat._id === categoryId);
        
        if (currentCategory) {
          setCategoryName(currentCategory.name);
        } else {
          // If not found in the list, we can't do much without the failing API
          setCategoryName("Category");
        }
      } catch (error) {
        console.error("Error fetching category details:", error);
        setCategoryName("Category");
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchCategoryDetails();
    }
  }, [categoryId, categoryName]);

  useEffect(() => {
    if (categoryName) {
      setExtraCrumbs([
        { label: categoryName, path: `/service-categories/${categoryId}` }
      ]);
    }
    return () => setExtraCrumbs([]);
  }, [categoryName, categoryId, setExtraCrumbs]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500 animate-pulse text-sm font-medium">Loading category details...</div>
      </div>
    );
  }

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

