import RightSide from "./components/rightSide";
import LeftSide from "./components/leftSide";

export default function Login() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <LeftSide />
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <RightSide />
          </div>
        </div>
      </div>
    </div>
  );
}
