import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

export default function NotFound() {
  return (
    <div className="page-shell flex min-h-[70vh] items-center justify-center">
      <Card className="max-w-xl text-center">
        <p className="section-label">404</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
          Page not found
        </h1>
        <p className="mt-4 text-sm leading-6 text-slate-500">
          The route you requested does not exist in ScholarHub. Let&apos;s get you back
          to a working page.
        </p>
        <Button as={Link} className="mt-8" size="lg" to="/">
          Return home
        </Button>
      </Card>
    </div>
  );
}
