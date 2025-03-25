
// import { useGlobalContext } from '../provider/Context'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Link, ShieldCheck, BarChart3 } from "lucide-react"
import { useNavigate } from 'react-router-dom';

function Landing() {

  const navigate=useNavigate()

  return (
    <>
      <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <img
                alt="Blockchain Supply Chain"
                className="mx-auto aspect-video overflow-hidden rounded-xl sm:w-full lg:order-last"
  
                src="/hero_image.svg"
              />
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Revolutionize Your Supply Chain with Blockchain
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                    Enhance transparency, traceability, and efficiency in your supply chain operations with our
                    cutting-edge blockchain solution.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button className="inline-flex h-10 items-center justify-center rounded-md bg-gray-900 px-8 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300"
                  onClick={()=>navigate('/navigation')}>
                    Get Started
                  </Button>
                  <Button
                    className="inline-flex h-10 items-center justify-center rounded-md border border-gray-200 bg-white px-8 text-sm font-medium shadow-sm transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus-visible:ring-gray-300"
                    variant="outline"
                  >
                    Learn More
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">Key Features</h2>
            <div className="grid gap-24 sm:grid-cols-2 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-3 text-center">
                <ShieldCheck className="h-12 w-12 text-gray-900 dark:text-gray-50" />
                <h3 className="text-xl font-bold">Enhanced Security</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Immutable and encrypted records ensure the highest level of data security and integrity.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-3 text-center">
                <Link className="h-12 w-12 text-gray-900 dark:text-gray-50" />
                <h3 className="text-xl font-bold">End-to-End Traceability</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Track products from origin to destination with complete transparency and real-time updates.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-3 text-center">
                <BarChart3 className="h-12 w-12 text-gray-900 dark:text-gray-50" />
                <h3 className="text-xl font-bold">Advanced Analytics</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Gain valuable insights with powerful analytics tools to optimize your supply chain.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">How It Works</h2>
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              {/* <img
                alt="Blockchain Process"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
                height="550"
                src="https://private-user-images.githubusercontent.com/119132631/406743834-b2130be5-dc0e-4843-82a7-3532d044a787.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3Mzg2ODcyODEsIm5iZiI6MTczODY4Njk4MSwicGF0aCI6Ii8xMTkxMzI2MzEvNDA2NzQzODM0LWIyMTMwYmU1LWRjMGUtNDg0My04MmE3LTM1MzJkMDQ0YTc4Ny5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjUwMjA0JTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI1MDIwNFQxNjM2MjFaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT1iM2Q3NDhkMDRjYWQyZmZhMTBjMGE0ODVkNzMxZjJjYTM0NzcwZmE0MThmZGFmOGUxZDJmNDFiNmU1ZTJjNTY1JlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.MddyZmlS88nCg9lIOvY-3fy2ag1SxMkiFZZwBuIYAwo"
                width="550"
              /> */}
              <div className="flex flex-col justify-center space-y-4">
                <ol className="space-y-4">
                  <li className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-white">
                      1
                    </div>
                    <span>Connect your supply chain partners to our secure blockchain network.</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-white">
                      2
                    </div>
                    <span>Record and verify transactions at each stage of the supply chain.</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-white">
                      3
                    </div>
                    <span>Access real-time data and analytics through our intuitive dashboard.</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-white">
                      4
                    </div>
                    <span>Optimize your operations based on actionable insights and forecasts.</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </section>
        <section id="contact" className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Ready to Transform Your Supply Chain?
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Get in touch with our team to schedule a demo and see how our blockchain solution can revolutionize
                  your supply chain management.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <form className="flex flex-col gap-2">
                  <Input className="max-w-lg flex-1" placeholder="Enter your email" type="email" />
                  <Button type="submit">Contact Us</Button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
     
    </div>
    </>
  )
}

export default Landing