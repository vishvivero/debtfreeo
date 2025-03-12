
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PlusCircle } from "lucide-react";

export const AdminBlogHeader = () => (
  <div className="flex justify-between items-center">
    <h2 className="text-2xl font-bold">Manage Blog Posts</h2>
    <Link to="/admin/new-post">
      <Button>
        <PlusCircle className="w-4 h-4 mr-2" />
        New Post
      </Button>
    </Link>
  </div>
);
