import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <nav className="-mx-5 -my-2 flex flex-wrap justify-center" aria-label="Footer">
          <div className="px-5 py-2">
            <Link href="/" className="text-base text-gray-300 hover:text-white">
              Home
            </Link>
          </div>
          <div className="px-5 py-2">
            <Link href="/about" className="text-base text-gray-300 hover:text-white">
              About
            </Link>
          </div>
          {/* Add more footer links as needed */}
        </nav>
        <p className="mt-8 text-center text-base text-gray-400">
          &copy; 2024 Your Company Name. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
