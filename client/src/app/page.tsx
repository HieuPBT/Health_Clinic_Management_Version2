import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronRight } from "lucide-react"

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center">Welcome to Our Next.js App</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: "Feature 1", description: "Amazing feature that will blow your mind." },
          { title: "Feature 2", description: "Incredible functionality you can't live without." },
          { title: "Feature 3", description: "Revolutionary tool to boost your productivity." },
        ].map((feature, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle>{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline">
                Learn More
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
