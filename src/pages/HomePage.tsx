import { useEffect } from "react";
import { UsersService } from "../services";
import { useNavigate } from "react-router-dom";
const HomePage = () => {
	const navigate = useNavigate();
  const user = JSON.parse(localStorage.user);

  useEffect(() => {
    const fetchUser = async () => {
			try {
        if (!user) {
					const response = await UsersService.get();
					localStorage.setItem("user", JSON.stringify(response.data));
				}
      } catch (error) {
        console.error("Ошибка при загрузке пользователя:", error);
        navigate("/auth/login");
      }
    };

    fetchUser();
  }, []);
  return <div>Home Page</div>;
};

export default HomePage;
