import { memo } from "react";

export const Footer = memo(function Footer() {
  return (
    <footer className="border-t py-6">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        <p>
          Human Detection System • Built with Next.js + FastAPI + YOLOv8 •
          Nguyễn Ngọc Thiện
        </p>
      </div>
    </footer>
  );
});
