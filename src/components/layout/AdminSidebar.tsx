
import { NavLink } from "react-router-dom";
import { 
  BarChart3, 
  BookText, 
  FolderOpen, 
  PlusCircle, 
  Users, 
  Settings, 
  ShieldAlert, 
  FileText, 
  LineChart, 
  ClipboardList,
  Bell,
  Upload
} from "lucide-react";

export const AdminSidebar = () => {
  return (
    <div className="w-full h-full flex flex-col bg-background border-r">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-foreground">Admin Portal</h2>
        <p className="text-sm text-muted-foreground">Manage your website</p>
      </div>
      <div className="flex-1 px-3 py-2 space-y-1">
        <NavLink to="/admin" end className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-muted">
          <BarChart3 className="w-5 h-5 mr-3 text-muted-foreground" />
          Dashboard
        </NavLink>
        
        <div className="pt-5 pb-2">
          <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Content Management
          </p>
        </div>
        
        <NavLink to="/admin/blogs" className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-muted">
          <BookText className="w-5 h-5 mr-3 text-muted-foreground" />
          Blog Posts
        </NavLink>
        
        <NavLink to="/admin/new-post" className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-muted">
          <PlusCircle className="w-5 h-5 mr-3 text-muted-foreground" />
          New Post
        </NavLink>
        
        <NavLink to="/admin/bulk-upload" className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-muted">
          <Upload className="w-5 h-5 mr-3 text-muted-foreground" />
          Bulk Upload
        </NavLink>
        
        <NavLink to="/admin/categories" className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-muted">
          <FolderOpen className="w-5 h-5 mr-3 text-muted-foreground" />
          Categories
        </NavLink>
        
        <NavLink to="/admin/banner" className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-muted">
          <Bell className="w-5 h-5 mr-3 text-muted-foreground" />
          Banner Settings
        </NavLink>
        
        <div className="pt-5 pb-2">
          <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Administration
          </p>
        </div>
        
        <NavLink to="/admin/users" className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-muted">
          <Users className="w-5 h-5 mr-3 text-muted-foreground" />
          User Management
        </NavLink>
        
        <NavLink to="/admin/settings" className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-muted">
          <Settings className="w-5 h-5 mr-3 text-muted-foreground" />
          System Settings
        </NavLink>
        
        <NavLink to="/admin/security" className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-muted">
          <ShieldAlert className="w-5 h-5 mr-3 text-muted-foreground" />
          Security
        </NavLink>
        
        <div className="pt-5 pb-2">
          <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Analytics
          </p>
        </div>
        
        <NavLink to="/admin/content" className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-muted">
          <FileText className="w-5 h-5 mr-3 text-muted-foreground" />
          Content Analytics
        </NavLink>
        
        <NavLink to="/admin/analytics" className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-muted">
          <LineChart className="w-5 h-5 mr-3 text-muted-foreground" />
          Site Analytics
        </NavLink>
        
        <NavLink to="/admin/audit-logs" className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-muted">
          <ClipboardList className="w-5 h-5 mr-3 text-muted-foreground" />
          Audit Logs
        </NavLink>
      </div>
    </div>
  );
};
