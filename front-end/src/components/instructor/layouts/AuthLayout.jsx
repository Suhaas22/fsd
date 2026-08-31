import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-navy-50/50 flex text-navy-900 font-sans selection:bg-primary-100 selection:text-primary-900">
      <div className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="text-center text-3xl font-bold tracking-tight text-navy-900 mb-2">
            Edu<span className="text-primary-600">LMS</span>
          </h2>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
