import { APP_NAME } from "@justread/shared";
console.log(APP_NAME);

const HomePage = () => {
  return (
    <div>
      <h1>Welcome to {APP_NAME}</h1>
      <p>This is the home page of the JustRead application.</p>
    </div>
  );
};

export default HomePage;
