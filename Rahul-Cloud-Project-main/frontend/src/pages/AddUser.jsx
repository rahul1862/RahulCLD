import { useNavigate } from "react-router-dom";
import { userService } from "../services/api";
import { useToast } from "../context/ToastContext";
import UserForm from "../components/users/UserForm";

export default function AddUser() {
  const navigate = useNavigate();
  const toast    = useToast();

  const handleSubmit = async (form) => {
    await userService.create(form);
    toast("Person added", "success");
    navigate("/users");
  };

  return (
    <div className="page max-w-md">
      <div className="mb-6">
        <h1 className="text-[17px] font-semibold text-ink-900 dark:text-ink-100">Add person</h1>
        <p className="text-[13px] text-ink-400 dark:text-ink-600 mt-0.5">Create a new entry in your directory.</p>
      </div>
      <div className="bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-800 rounded-xl p-5 sm:p-6">
        <UserForm
          submitLabel="Add person"
          onSubmit={handleSubmit}
          onCancel={() => navigate("/users")}
        />
      </div>
    </div>
  );
}
