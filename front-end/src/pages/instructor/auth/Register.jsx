import { Link } from "react-router-dom";
import { Button } from "../../../components/instructor/ui/Button";
import { Input } from "../../../components/instructor/ui/Input";
import { BookOpen } from "lucide-react";

export function Register() {
  return (
    <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8 bg-navy-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center gap-2 text-primary-700 mb-6">
          <BookOpen className="w-10 h-10" />
          <span className="text-3xl font-bold">EduLMS</span>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-navy-900">
          Create your instructor account
        </h2>
        <p className="mt-2 text-center text-sm text-navy-500">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-500">
            Log in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12 border border-navy-200">
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-sm font-medium text-navy-700">
                Full Name
              </label>
              <div className="mt-2">
                <Input required type="text" placeholder="Dr. Sarah Jenkins" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-700">
                Email address
              </label>
              <div className="mt-2">
                <Input required type="email" placeholder="sarah@example.com" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-navy-700">
                  Password
                </label>
                <div className="mt-2">
                  <Input required type="password" placeholder="••••••••" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700">
                  Confirm Password
                </label>
                <div className="mt-2">
                  <Input required type="password" placeholder="••••••••" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-700">
                Organization (Optional)
              </label>
              <div className="mt-2">
                <Input type="text" placeholder="University of Technology" />
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 rounded border-navy-300 text-primary-600 focus:ring-primary-600"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-navy-900">
                I agree to the{" "}
                <a href="#" className="text-primary-600 hover:text-primary-500">
                  Terms and Conditions
                </a>
              </label>
            </div>

            <div>
              <Button type="submit" className="w-full" size="lg">
                Create Account
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-navy-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-navy-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <Button variant="outline" className="w-full">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  <path d="M1 1h22v22H1z" fill="none" />
                </svg>
                Google
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
