import { stat } from "fs";
import { useEffect, useMemo, useState } from "react";

function A() {
  console.log("A");
  return <B />;
}
const B = useMemo(() => {
  console.log("B");
  return <C />;
});

function C() {
  console.log("C");
  return null;
}
function D() {
  console.log("D");
  return null;
}

function App() {
  const [state, setState] = useState(0);

  useEffect(() => {
    setState((state) => state + 1);
  }, []);

  console.log("App");

  return (
    <div>
      <A state={state} />
      <D />
    </div>
  );
}
