import { useEffect, useState } from "react";

function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("user");

      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error("Profile load error:", error);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900">
          Rider Profile
        </h1>

        <p className="text-gray-500 mt-1 mb-8">
          Your delivery partner information.
        </p>

        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <div className="space-y-5">
            <div>
              <p className="text-sm text-gray-500">
                Name
              </p>
              <p className="font-semibold mt-1">
                {user?.name || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Email
              </p>
              <p className="font-semibold mt-1">
                {user?.email || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Phone
              </p>
              <p className="font-semibold mt-1">
                {user?.phone || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Role
              </p>
              <p className="font-semibold mt-1 text-orange-600">
                Rider
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;