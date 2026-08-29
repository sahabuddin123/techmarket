import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import CartDrawer from '@/Components/CartDrawer';
import { 
  CheckCircle2, Award, ShieldCheck, Zap, Lightbulb, 
  Monitor, Laptop, Printer, Camera, HardDrive, 
  Network, Eye, Shield, MapPin, Store, Sparkles
} from 'lucide-react';

export default function AboutUs() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-slate-800 font-sans flex flex-col selection:bg-[#0084ff] selection:text-white">
      <Head title="About Tech Market BD - Your Trusted Technology Partner" />
      <Navbar onOpenCart={() => setCartOpen(true)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 py-8">
        <div className="bg-white rounded-lg border border-slate-200 p-6 md:p-12 shadow-xs max-w-5xl mx-auto space-y-8">
          
          {/* Top Header */}
          <div className="pb-4 border-b border-slate-200">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              About Tech Market BD
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Your trusted partner in technology since 2016
            </p>
          </div>

          {/* Section 1: Introduction */}
          <div className="space-y-3">
            <div className="inline-block bg-[#ebf3ff] text-[#0084ff] px-3.5 py-1.5 rounded text-xs font-bold shadow-2xs">
              Introduction
            </div>
            
            <p className="text-xs text-slate-700 leading-relaxed pt-1">
              Tech Market is a reputable and forward-thinking computer hardware, software, and service supplier company that was established in August 2016. Since our inception, we have consistently grown and evolved, expanding our portfolio to offer a comprehensive range of computing services, products, and solutions.
            </p>

            <p className="text-xs text-slate-600">
              Operating under the name "Tech Market" we are proud to hold:
            </p>

            <div className="flex flex-wrap gap-2.5 pt-1">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0084ff]" />
                <span>DBID: 312659016</span>
              </span>
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0084ff]" />
                <span>BIN: 001614123-0201</span>
              </span>
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0084ff]" />
                <span>TIN: 363773344098</span>
              </span>
            </div>
          </div>

          {/* Section 2: Our Mission */}
          <div className="space-y-2 pt-2">
            <h3 className="text-sm font-bold text-slate-900">
              Our Mission
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              Tech Market's mission is to supply genuine computer products and dependable service to customers across Bangladesh. We help individuals and businesses choose the right hardware and software, offer them at fair and competitive prices, and stand behind every sale with knowledgeable after-sales support. Our goal is to be a trusted one-stop shop for computing needs so our customers can stay productive and get lasting value from their technology.
            </p>
          </div>

          {/* Section 3: Our Objective */}
          <div className="space-y-4 pt-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Our Objective
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed mt-1">
                The core objective of Tech Market is to serve customers in both the public and private sectors. We aspire to offer our customers complete solutions, encompassing everything from initial study and design to hardware and software supply, expert guidance on product selection, service, and comprehensive training. Our unwavering commitment to the following key principles sets us apart:
              </p>
            </div>

            {/* 4 Principle Cards Matching Reference Screenshot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/40 space-y-1.5">
                <div className="flex items-center space-x-2 text-[#0084ff] font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Quality</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  We are dedicated to delivering top-quality products and services.
                </p>
              </div>

              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/40 space-y-1.5">
                <div className="flex items-center space-x-2 text-[#0084ff] font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Service</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Our commitment to service excellence is at the heart of our business.
                </p>
              </div>

              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/40 space-y-1.5">
                <div className="flex items-center space-x-2 text-[#0084ff] font-bold">
                  <Zap className="w-4 h-4" />
                  <span>Efficiency</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  We ensure efficiency in all our operations to meet customer needs promptly.
                </p>
              </div>

              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/40 space-y-1.5">
                <div className="flex items-center space-x-2 text-[#0084ff] font-bold">
                  <Lightbulb className="w-4 h-4" />
                  <span>Innovation</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  We continuously explore innovative solutions to stay ahead in the industry.
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Products & Services */}
          <div className="space-y-4 pt-2">
            <div className="inline-block bg-[#f3f0ff] text-[#6d28d9] px-3.5 py-1.5 rounded text-xs font-bold shadow-2xs">
              Products & Services
            </div>
            
            <p className="text-xs text-slate-700">
              Tech Market provides a diverse range of products and services to meet the evolving needs of our clients. Our product line includes:
            </p>

            {/* 9 Product Categories Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-xs">
              
              <div className="border border-slate-200 rounded-lg p-3.5 bg-white flex items-start space-x-3">
                <div className="p-2 rounded bg-purple-50 text-[#6d28d9] shrink-0">
                  <Monitor className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Computer Systems</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Desktops for home & office, Workstations & Servers</p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg p-3.5 bg-white flex items-start space-x-3">
                <div className="p-2 rounded bg-purple-50 text-[#6d28d9] shrink-0">
                  <Laptop className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Notebooks and Handhelds</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">complete with a full range of accessories</p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg p-3.5 bg-white flex items-start space-x-3">
                <div className="p-2 rounded bg-purple-50 text-[#6d28d9] shrink-0">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Printing & Multifunction</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">printers, fax, copiers, print servers, Large format printers, and Plotters</p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg p-3.5 bg-white flex items-start space-x-3">
                <div className="p-2 rounded bg-purple-50 text-[#6d28d9] shrink-0">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Digital Imaging & Audio</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Scanners, Digital Projectors, Digital Audio Devices, Digital Cameras</p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg p-3.5 bg-white flex items-start space-x-3">
                <div className="p-2 rounded bg-purple-50 text-[#6d28d9] shrink-0">
                  <HardDrive className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Storage</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Storage Area Networks (SAN), Network Attached Storage (NAS), HDD, SSD</p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg p-3.5 bg-white flex items-start space-x-3">
                <div className="p-2 rounded bg-purple-50 text-[#6d28d9] shrink-0">
                  <Network className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Networking</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Home & Office networking, Switches and Hubs, Routers</p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg p-3.5 bg-white flex items-start space-x-3">
                <div className="p-2 rounded bg-purple-50 text-[#6d28d9] shrink-0">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Monitors</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">PC monitors, LCD, and multi-media displays</p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg p-3.5 bg-white flex items-start space-x-3">
                <div className="p-2 rounded bg-purple-50 text-[#6d28d9] shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Software Distribution</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Microsoft, Autodesk, Adobe, Antivirus</p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg p-3.5 bg-white flex items-start space-x-3">
                <div className="p-2 rounded bg-purple-50 text-[#6d28d9] shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Security & Surveillance</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">CCTV cameras, Access Control, Time Attendance</p>
                </div>
              </div>

            </div>
          </div>

          {/* Section 5: Partners & Affiliations */}
          <div className="space-y-5 pt-2">
            <div className="inline-block bg-[#fef9c3] text-[#854d0e] px-3.5 py-1.5 rounded text-xs font-bold shadow-2xs">
              Partners & Affiliations
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              At Tech Market, we pride ourselves on our exceptional connections and partnerships. We have a strong and direct relationship with manufacturers, ensuring that we can provide our clients with the highest quality products at the most competitive prices. We proudly partner with and highly recommend various computer, network, and components manufacturers.
            </p>

            {/* Vendor Partner Badges */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              {['HP Gold Partner', 'Lenovo PC Partner', 'ASUS Business', 'Intel Gold Partner', 'BenQ Premium Partner', 'Dell Technologies Gold', 'MSI Authorized', 'Corsair Gold Certified'].map((pName, pIdx) => (
                <div key={pIdx} className="bg-white border border-slate-200 rounded p-2.5 text-xs font-bold text-slate-800 shadow-2xs">
                  {pName}
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-700 leading-relaxed pt-1">
              In addition to manufacturer certifications, Tech Market holds memberships with organizations such as BASIS (Member ID: AF-24-08-060), Bangladesh Computer Samity (Member ID: 1597), Elephant Road Computer Baboshayee Kallyan Samity (Member ID: 341) and e-CAB (Member ID: 1690), further validating the authenticity and quality of our services.
            </p>

            {/* 4 Membership Verification Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              
              <div className="border border-slate-200 rounded-lg p-4 bg-white text-center space-y-2">
                <div className="font-extrabold text-[#0084ff] text-base">BASIS</div>
                <div className="text-[10px] text-slate-500 font-medium">Member ID: AF-24-08-060</div>
              </div>

              <div className="border border-slate-200 rounded-lg p-4 bg-white text-center space-y-2">
                <div className="font-extrabold text-[#0084ff] text-base">BCS</div>
                <div className="text-[10px] text-slate-500 font-medium">Member ID: 1597</div>
              </div>

              <div className="border border-slate-200 rounded-lg p-4 bg-white text-center space-y-2">
                <div className="font-extrabold text-[#0084ff] text-base">ECSKB</div>
                <div className="text-[10px] text-slate-500 font-medium">Member ID: 341</div>
              </div>

              <div className="border border-slate-200 rounded-lg p-4 bg-white text-center space-y-2">
                <div className="font-extrabold text-[#0084ff] text-base">e-CAB</div>
                <div className="text-[10px] text-slate-500 font-medium">Member ID: 1690</div>
              </div>

            </div>
          </div>

          {/* Section 6: Our Commitment */}
          <div className="space-y-4 pt-2">
            <div className="inline-block bg-[#fef2f2] text-[#991b1b] px-3.5 py-1.5 rounded text-xs font-bold shadow-2xs">
              Our Commitment
            </div>

            <div className="text-xs text-slate-700 space-y-2 leading-relaxed">
              <p>
                Tech Market is dedicated to helping businesses and individuals harness the power of technology. With a focus on quality, service, efficiency, and innovation, we are your trusted partner in the world of computing.
              </p>
              <p>
                Our commitment to excellence ensures that we are well-positioned to meet your needs, whether you're in the public or private sector. Join us on this technology journey, and experience the difference that Tech Market can make in your world.
              </p>
            </div>

            <div className="pt-2 flex justify-center">
              <Link
                href="/servicing"
                className="inline-flex items-center space-x-2 bg-[#0084ff] hover:bg-[#0070d6] text-white px-6 py-2.5 rounded text-xs font-bold transition-colors shadow-xs"
              >
                <Store className="w-4 h-4" />
                <span>Visit Our Stores</span>
              </Link>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
