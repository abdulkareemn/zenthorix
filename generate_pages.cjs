const fs = require('fs');
const path = require('path');

const adminPages = [
  'Dashboard', 'Candidates', 'Exams', 'Proctoring', 'Alerts', 'Results', 'Settings'
];

adminPages.forEach(page => {
  const code = `import React from 'react';\n\nconst Admin${page} = () => {\n  return (\n    <div className="p-6">\n      <h1 className="text-2xl font-bold bg-white p-4 rounded-md shadow-sm">Admin ${page}</h1>\n    </div>\n  );\n};\n\nexport default Admin${page};\n`;
  fs.writeFileSync(path.join(__dirname, 'src', 'pages', 'admin', `${page}.jsx`), code);
});

// AdminLayout
const adminLayout = `import React from 'react';
import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Basic Admin Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-200 shrink-0 hidden lg:flex flex-col text-white">
         <div className="p-6 text-xl font-bold border-b border-gray-800">Admin Control</div>
      </aside>
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6">Admin Header</header>
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
export default AdminLayout;
`;
fs.writeFileSync(path.join(__dirname, 'src', 'layouts', 'AdminLayout.jsx'), adminLayout);

// update StudentLayout exports internally
const studentLayoutPath = path.join(__dirname, 'src', 'layouts', 'StudentLayout.jsx');
let sl = fs.readFileSync(studentLayoutPath, 'utf8');
sl = sl.replace(/DashboardLayout/g, 'StudentLayout');
fs.writeFileSync(studentLayoutPath, sl);
