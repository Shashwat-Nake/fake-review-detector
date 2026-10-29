"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Upload, FileText, AlertTriangle, CheckCircle, Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { analyzeBatchReviews } from "@/lib/analyze-review"
import type { ReviewData } from "@/lib/types"

export function ReviewBatchUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [batchResults, setBatchResults] = useState<ReviewData[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    try {
      // In a real app, you would parse the CSV/JSON file here
      // For demo purposes, we'll simulate batch analysis
      const results = await analyzeBatchReviews(file)
      setBatchResults(results)
    } catch (error) {
      console.error("Error processing file:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const getBadgeForProbability = (probability: number) => {
    if (probability > 0.7) {
      return (
        <Badge variant="destructive" className="bg-gradient-to-r from-red-500 to-red-600 shadow-lg border-0">
          <AlertTriangle className="mr-1 h-3 w-3" />
          Likely Fake
        </Badge>
      )
    } else if (probability > 0.3) {
      return (
        <Badge
          variant="outline"
          className="bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 border-yellow-300 dark:border-yellow-700 shadow-md"
        >
          <Info className="mr-1 h-3 w-3" />
          Suspicious
        </Badge>
      )
    } else {
      return (
        <Badge
          variant="outline"
          className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 border-green-300 dark:border-green-700 shadow-md"
        >
          <CheckCircle className="mr-1 h-3 w-3" />
          Authentic
        </Badge>
      )
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid w-full gap-3">
        <Label htmlFor="file" className="font-serif text-lg font-semibold text-slate-700 dark:text-slate-200">
          Upload CSV or JSON file with reviews
        </Label>
        <div className="flex gap-3">
          <Input
            id="file"
            type="file"
            accept=".csv,.json"
            onChange={handleFileChange}
            className="input-glossy flex-1"
          />
          <Button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="glossy-button bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white border-0 shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            {isUploading ? "Processing..." : "Upload"}
            <Upload className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <p className="font-body text-sm text-muted-foreground">
          Upload a CSV or JSON file containing reviews to analyze in batch
        </p>
      </div>

      {batchResults.length > 0 && (
        <Card className="glossy-card rounded-xl overflow-hidden border-0 shadow-2xl">
          <div className="overflow-hidden">
            <Table>
              <TableHeader className="bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800">
                <TableRow className="border-b border-slate-200/50 dark:border-slate-700/50">
                  <TableHead className="w-[50px] font-serif font-semibold text-slate-700 dark:text-slate-200">
                    #
                  </TableHead>
                  <TableHead className="font-serif font-semibold text-slate-700 dark:text-slate-200">
                    Review Text
                  </TableHead>
                  <TableHead className="w-[150px] font-serif font-semibold text-slate-700 dark:text-slate-200">
                    Fake Probability
                  </TableHead>
                  <TableHead className="w-[120px] font-serif font-semibold text-slate-700 dark:text-slate-200">
                    Sentiment
                  </TableHead>
                  <TableHead className="w-[120px] font-serif font-semibold text-slate-700 dark:text-slate-200">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batchResults.map((result, index) => (
                  <TableRow key={index} className="table-row-glossy hover:scale-[1.01] transition-all duration-200">
                    <TableCell className="font-body font-medium">{index + 1}</TableCell>
                    <TableCell className="max-w-[300px] truncate font-body">{result.text}</TableCell>
                    <TableCell className="font-body">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium shadow-md ${
                          result.fakeProbability > 0.7
                            ? "bg-gradient-to-r from-red-100 to-red-200 text-red-800 dark:from-red-900/30 dark:to-red-800/30 dark:text-red-200"
                            : result.fakeProbability > 0.3
                              ? "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 dark:from-yellow-900/30 dark:to-yellow-800/30 dark:text-yellow-200"
                              : "bg-gradient-to-r from-green-100 to-green-200 text-green-800 dark:from-green-900/30 dark:to-green-800/30 dark:text-green-200"
                        }`}
                      >
                        {(result.fakeProbability * 100).toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell className="font-body">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium shadow-md ${
                          result.sentimentScore < -0.3
                            ? "bg-gradient-to-r from-red-100 to-red-200 text-red-800 dark:from-red-900/30 dark:to-red-800/30 dark:text-red-200"
                            : result.sentimentScore > 0.3
                              ? "bg-gradient-to-r from-green-100 to-green-200 text-green-800 dark:from-green-900/30 dark:to-green-800/30 dark:text-green-200"
                              : "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 dark:from-yellow-900/30 dark:to-yellow-800/30 dark:text-yellow-200"
                        }`}
                      >
                        {result.sentimentScore.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>{getBadgeForProbability(result.fakeProbability)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {!batchResults.length && file && (
        <div className="flex h-[200px] items-center justify-center rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 shadow-inner">
          <div className="flex flex-col items-center gap-2 text-center">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <p className="font-body text-base text-muted-foreground">{file.name} selected. Click Upload to analyze.</p>
          </div>
        </div>
      )}

      {!file && !batchResults.length && (
        <div className="flex h-[200px] items-center justify-center rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 shadow-inner">
          <div className="flex flex-col items-center gap-2 text-center">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <p className="font-body text-base text-muted-foreground">No file selected</p>
          </div>
        </div>
      )}
    </div>
  )
}
