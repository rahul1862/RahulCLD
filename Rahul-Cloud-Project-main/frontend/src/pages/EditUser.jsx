import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useUser } from "../hooks/useUsers";
import { userService } from "../services/api";
import { useToast } from "../context/ToastContext";
import UserForm from "../components/users/UserForm";
import { SkeletonForm } from "../components/ui/Skeleton";
import { ErrorState } from "../components/ui/States";

export default function EditUser() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const toast    = useToast();
  const { user, loading, error } = useUser(id);

  const handleSubmit = async (form) => {
    await userService.update(id, form);
    toast("Changes saved", "success");
    navigate(`/user/${id}`);
  };

  return (
    <div className="page max-w-md">
      <Link
        to={`/user/${id}`}
        className="inline-flex items-center gap-1.5 text-[12px] text-ink-400 dark:text-ink-600 hover:text-ink-700 dark:hover:text-ink-300 transition-colors mb-5 group"
      >
        <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
        Back
      </Link>

      <div className="mb-5">
        <h1 className="text-[17px] font-semibold text-ink-900 dark:text-ink-100">Edit person</h1>
        {user && <p className="text-[13px] text-ink-400 dark:text-ink-600 mt-0.5">Updating {user.name}</p>}
      </div>

      {loading && <SkeletonForm />}
      {error   && <ErrorState message={error} />}

      {user && !loading && (
        <div className="bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-800 rounded-xl p-5 sm:p-6 animate-in">
          <UserForm
            initial={user}
            submitLabel="Save changes"
            onSubmit={handleSubmit}
            onCancel={() => navigate(`/user/${id}`)}
          />
        </div>
      )}
    </div>
  );
}
