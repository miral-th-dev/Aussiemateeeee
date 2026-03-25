import { useMemo, useRef, useState } from "react";
import { Flag, Star, Upload } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

const isValidImageUrl = (url) => {
  if (!url || typeof url !== "string") return false;
  return url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:");
};

const getInitials = (firstName, lastName, fullName) => {
  if (firstName && lastName) {
    return `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`;
  }
  if (fullName) {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0].charAt(0).toUpperCase()}${parts[parts.length - 1].charAt(0).toUpperCase()}`;
    }
    return parts[0].charAt(0).toUpperCase();
  }
  return "?";
};

const getAvatarColor = (name, id) => {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#FFA07A",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E2",
    "#F8B739",
    "#52BE80",
    "#EC7063",
    "#5DADE2",
    "#F1948A",
    "#82E0AA",
    "#F4D03F",
    "#A569BD",
  ];
  const str = name || id || "default";
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const matePoints = [
  { id: "AM10432", points: 200, service: "Cleaning • Bond Cleaning" },
  { id: "AM10433", points: 100, service: "Handyman" },
  { id: "AM10433-2", points: 100, service: "Handyman" },
];

export default function FeedbackTab({ customer, reviews = [], pagination }) {
  const [failedImages, setFailedImages] = useState(new Set());

  const averageRating = useMemo(() => {
    // Prefer backend average if provided
    if (pagination?.averageRating !== undefined && pagination?.averageRating !== null) {
      return Number(pagination.averageRating || 0).toFixed(1);
    }
    const list = Array.isArray(reviews) ? reviews : [];
    if (!list.length) return "0.0";
    const total = list.reduce((sum, item) => sum + Number(item.rating || 0), 0);
    return (total / list.length).toFixed(1);
  }, [reviews, pagination?.averageRating]);

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-1">
        {[...Array(fullStars)].map((_, i) => (
          <Star
            key={`full-${i}`}
            size={18}
            className="text-[#F6B100] fill-[#F6B100]"
          />
        ))}
        {hasHalfStar && (
          <Star
            size={18}
            className="text-[#F6B100] fill-[#F6B100]"
            style={{ clipPath: "inset(0 50% 0 0)" }}
          />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star
            key={`empty-${i}`}
            size={18}
            className="text-[#E5E7EB] fill-none"
          />
        ))}
      </div>
    );
  };

  const handleFlagReview = (feedbackId) => {
    // TODO: wire flag review action
    console.log("Flag review clicked", feedbackId);
  };

  const mappedReviews = useMemo(() => {
    const list = Array.isArray(reviews) ? reviews : [];
    return list.map((r) => {
      const cleaner = r?.cleaner || {};
      const cleanerName = `${cleaner?.firstName || ""} ${cleaner?.lastName || ""}`.trim() || "Cleaner";
      const service = r?.job?.serviceType || "Service";
      const jobId = r?.job?.jobId || r?.job?.id || "";
      const feedbackText = (r?.feedback || "").toString().trim();
      const rating = Number(r?.rating || 0);
      const avatarUrl = cleaner?.profilePhoto?.url || cleaner?.avatar || "";
      return {
        id: r?.id || r?._id,
        name: cleanerName,
        service: jobId ? `${service} • ${jobId}` : service,
        feedback: feedbackText,
        rating,
        avatar: avatarUrl,
        cleanerId: cleaner?.id || cleaner?._id,
        firstName: cleaner?.firstName,
        lastName: cleaner?.lastName,
      };
    });
  }, [reviews]);

  const matePointsRef = useRef(null);

  const handleExportReport = () => {
    const reportDate = new Date().toLocaleDateString('en-AU', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    const printWindow = window.open('', '_blank');
    const html = `
      <html>
        <head>
          <title>MatePoints Report - ${customer?.name || 'Customer'}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            body { 
              font-family: 'Inter', sans-serif; 
              padding: 40px; 
              color: #1C1C1C;
              line-height: 1.5;
            }
            .header { 
              display: flex; 
              justify-content: space-between; 
              align-items: flex-start;
              margin-bottom: 40px;
              border-bottom: 2px solid #F1F1F4;
              padding-bottom: 20px;
            }
            .logo { font-size: 24px; font-weight: 700; color: #1F6FEB; }
            .report-info { text-align: right; }
            .report-title { font-size: 28px; font-weight: 700; margin-bottom: 10px; }
            .customer-section { margin-bottom: 30px; }
            .customer-label { color: #78829D; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
            .customer-name { font-size: 18px; font-weight: 600; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { 
              text-align: left; 
              background: #F9FAFB; 
              padding: 12px 16px; 
              font-size: 12px; 
              font-weight: 600; 
              color: #78829D; 
              text-transform: uppercase;
              border-bottom: 1px solid #EEF0F5;
            }
            td { 
              padding: 16px; 
              border-bottom: 1px solid #EEF0F5; 
              font-size: 14px;
            }
            .points { font-weight: 600; color: #1C1C1C; }
            .footer { margin-top: 50px; font-size: 12px; color: #9CA3AF; text-align: center; }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">AussieMate</div>
              <div style="color: #78829D; font-size: 14px; margin-top: 4px;">Admin Portal</div>
            </div>
            <div class="report-info">
              <div style="font-size: 12px; color: #78829D;">Generated on</div>
              <div style="font-weight: 500;">${reportDate}</div>
            </div>
          </div>

          <div class="customer-section">
            <div class="report-title">MatePoints Report</div>
            <div class="customer-label">Customer Details</div>
            <div class="customer-name">${customer?.name || 'Valued Customer'}</div>
            <div style="color: #78829D; font-size: 14px;">${customer?.email || ''}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Points Accumulation</th>
                <th>Reference ID</th>
                <th>Service Description</th>
              </tr>
            </thead>
            <tbody>
              ${matePoints.map(row => `
                <tr>
                  <td class="points">${row.points} pts</td>
                  <td>${row.id}</td>
                  <td>${row.service}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            © ${new Date().getFullYear()} AussieMate. This is a system-generated report.
          </div>

          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); };
            };
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Feedback cards */}
      <div className="bg-transparent">
        <div className="overflow-hidden">
          {mappedReviews.length === 0 ? (
            <div className="bg-white border border-[#E5E7EB] rounded-[14px] p-6 text-sm text-primary-light">
              No reviews found for this customer.
            </div>
          ) : (
            <Swiper
              modules={[Autoplay]}
              spaceBetween={12}
              slidesPerView="auto"
              autoplay={{ delay: 2800, disableOnInteraction: false }}
              loop={mappedReviews.length > 1}
              className="!overflow-hidden !flex h-auto min-h-[160px] md:min-h-[180px]"
              style={{ display: "flex", alignItems: "stretch", paddingBottom: "8px" }}
            >
              {mappedReviews.map((item) => (
                <SwiperSlide
                  key={item.id}
                  className="!h-auto flex !w-[260px] md:!w-[350px]"
                  style={{ display: "flex" }}
                >
                  <div className="bg-white border border-[#E5E7EB] rounded-[14px] p-3 md:p-4 shadow-sm flex flex-col gap-2 md:gap-3 w-full h-full cursor-pointer">
                    <div className="flex items-center justify-between gap-2 md:gap-3 flex-shrink-0">
                      <div className="flex items-center gap-2 md:gap-3 min-w-0">
                        {item.avatar && isValidImageUrl(item.avatar) && !failedImages.has(item.id) ? (
                          <img
                            src={item.avatar}
                            alt={item.name}
                            className="w-7 h-7 md:w-9 md:h-9 rounded-full object-cover flex-shrink-0"
                            onError={() => setFailedImages((prev) => new Set(prev).add(item.id))}
                          />
                        ) : (
                          <div
                            className="w-7 h-7 md:w-9 md:h-9 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: getAvatarColor(item.name, item.cleanerId || item.id) }}
                          >
                            <span className="text-white text-[10px] md:text-xs font-semibold">
                              {getInitials(item.firstName, item.lastName, item.name)}
                            </span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs md:text-sm font-medium text-primary truncate">
                            {item.name}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col leading-tight flex-grow">
                      <p className="text-xs md:text-sm text-primary line-clamp-2">
                        {item.feedback}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="scale-90 md:scale-100 origin-left">
                        {renderStars(item.rating)}
                      </div>
                      <span className="text-xs md:text-sm font-medium text-primary">
                        {Number(item.rating || 0).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      </div>
    </div>
  );
}

