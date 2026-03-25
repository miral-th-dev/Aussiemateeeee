import { useEffect, useRef, useState } from "react";
import Input from "../common/Input";
import Button from "../common/Button";
import Loader from "../common/Loader";
import { useAuth } from "../../api/hooks/useAuth";

export default function Settings() {
  const { user, refreshProfile, updateProfile, uploadPhoto, deletePhoto, loading, error } = useAuth();
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "" });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [success, setSuccess] = useState(null);
  const [fileError, setFileError] = useState(null);
  const fileInputRef = useRef(null);

  // Load user data on mount
  useEffect(() => {
    refreshProfile().catch(() => { });
  }, [refreshProfile]);

  // Sync form when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
      });
      setImagePreview(user.profilePhoto?.url || null);
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/gif", "image/png"];
    if (!validTypes.includes(file.type)) {
      setFileError("Please upload a valid JPG, GIF or PNG file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setFileError("File size must be less than 2MB");
      return;
    }

    setFileError(null);
    setProfileImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleResetImage = async () => {
    // If there's a profile photo, delete it from backend
    if (user?.profilePhoto?.url) {
      try {
        await deletePhoto();
        setSuccess("Profile photo removed successfully.");
      } catch (err) {
        // Error handled in hook
        return;
      }
    }

    // Reset local state
    setProfileImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleResetForm = () => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
      });
      setImagePreview(user.profilePhoto?.url || null);
    } else {
      setFormData({ firstName: "", lastName: "", email: "" });
      setImagePreview(null);
    }
    setProfileImage(null);
    setSuccess(null);
  };

  const handleSaveChanges = async () => {
    setSuccess(null);
    try {
      await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
      });
      if (profileImage) {
        await uploadPhoto(profileImage);
        setProfileImage(null);
      }
      setSuccess("Profile updated successfully.");
    } catch (err) {
      // error handled in hook
    }
  };

  if (loading && !user) {
    return <Loader fullscreen message="Loading profile..." />;
  }

  return (
    <div className="w-full space-y-6">
      {loading && user && <Loader fullscreen message="Saving changes..." />}
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Status */}
        {(error || success) && (
          <div className="space-y-2">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {error}
              </div>
            )}
            {success && (
              <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-md px-3 py-2">
                {success}
              </div>
            )}
          </div>
        )}

        {/* Profile Section */}
        <div className="py-4 sm:py-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
            <div className="flex-shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden flex items-center justify-center mx-auto md:mx-0 bg-gray-100">
                {imagePreview ? (
                  <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <img src="/Profile.svg" alt="Profile" className="w-full h-full object-cover" />
                )}
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <input
                  ref={fileInputRef}
                  id="profile-image-upload"
                  type="file"
                  accept="image/jpeg,image/jpg,image/gif,image/png"
                  className="hidden"
                  onChange={handleImageUpload}
                />

                <Button
                  variant="primary"
                  size="md"
                  className="text-xs sm:text-[13px] md:text-sm"
                  onClick={handleUploadClick}
                  disabled={loading}
                >
                  Upload New Photo
                </Button>

                <Button
                  variant="outline"
                  size="md"
                  className="text-xs sm:text-[13px] md:text-sm"
                  onClick={handleResetImage}
                  disabled={loading}
                >
                  Reset
                </Button>
              </div>

              <p className={`text-xs sm:text-sm md:text-[16px] font-medium text-center md:text-left ${fileError ? 'text-red-500' : 'text-gray-500'}`}>
                {fileError || "Allowed JPG, GIF or PNG. Max size of 2MB"}
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200"></div>

        {/* Profile Info */}
        <div className="">
          <h2 className="text-[15px] sm:text-[17px] md:text-[18px] font-semibold text-primary mb-4 text-center md:text-left">
            Profile Info
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                name="firstName"
                placeholder="First name"
                value={formData.firstName}
                onChange={handleInputChange}
                labelClassName="text-[11px] sm:text-xs md:text-[13px] font-medium"
                disabled={loading}
              />

              <Input
                label="Last Name"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleInputChange}
                labelClassName="text-[11px] sm:text-xs md:text-[13px] font-medium"
                disabled={loading}
              />
            </div>

            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="Enter mail address"
              value={formData.email}
              onChange={handleInputChange}
              labelClassName="text-[11px] sm:text-xs md:text-[13px] font-medium"
              disabled={loading}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pb-6">
          <Button
            variant="primary"
            size="md"
            className="text-xs sm:text-[13px] md:text-sm"
            onClick={handleSaveChanges}
            disabled={loading}
          >
            Save Changes
          </Button>

          <Button
            variant="outline"
            size="md"
            className="text-xs sm:text-[13px] md:text-sm"
            onClick={handleResetForm}
            disabled={loading}
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
