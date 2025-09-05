import jsPDF from 'jspdf';
import Papa from 'papaparse';

export async function exportToPDF(articles: any[], userInfo: any) {
  const pdf = new jsPDF();
  const pageHeight = pdf.internal.pageSize.height;
  let y = 20;

  // Header
  pdf.setFontSize(20);
  pdf.text('NewsGenie Export Report', 20, y);
  y += 15;

  pdf.setFontSize(12);
  pdf.text(`Generated for: ${userInfo.name || userInfo.email}`, 20, y);
  y += 10;
  pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, y);
  y += 20;

  // Articles
  pdf.setFontSize(16);
  pdf.text('Your Bookmarked Articles:', 20, y);
  y += 15;

  articles.forEach((article, index) => {
    if (y > pageHeight - 40) {
      pdf.addPage();
      y = 20;
    }

    pdf.setFontSize(14);
    pdf.text(`${index + 1}. ${article.title}`, 20, y);
    y += 10;

    pdf.setFontSize(10);
    if (article.description) {
      const splitDescription = pdf.splitTextToSize(article.description, 170);
      pdf.text(splitDescription, 20, y);
      y += splitDescription.length * 5 + 5;
    }

    pdf.setFontSize(8);
    pdf.text(`Source: ${article.source} | Published: ${new Date(article.publishedAt).toLocaleDateString()}`, 20, y);
    y += 10;

    if (article.summary) {
      pdf.text(`AI Summary: ${article.summary}`, 20, y);
      y += 8;
    }

    pdf.text(`URL: ${article.url}`, 20, y);
    y += 15;
  });

  return pdf;
}

export function exportToCSV(articles: any[]) {
  const csvData = articles.map(article => ({
    Title: article.title,
    Description: article.description || '',
    Source: article.source,
    Category: article.category,
    'Published Date': new Date(article.publishedAt).toLocaleDateString(),
    'AI Summary': article.summary || '',
    Sentiment: article.sentiment || '',
    Keywords: article.keywords?.join('; ') || '',
    Topics: article.topics?.join('; ') || '',
    URL: article.url,
  }));

  return Papa.unparse(csvData);
}

export async function exportAnalytics(analyticsData: any) {
  const pdf = new jsPDF();
  let y = 20;

  // Header
  pdf.setFontSize(20);
  pdf.text('NewsGenie Analytics Report', 20, y);
  y += 20;

  pdf.setFontSize(12);
  pdf.text(`Report Date: ${new Date().toLocaleDateString()}`, 20, y);
  y += 15;

  // Statistics
  pdf.setFontSize(16);
  pdf.text('Reading Statistics:', 20, y);
  y += 15;

  pdf.setFontSize(12);
  pdf.text(`Total Articles Read: ${analyticsData.totalRead || 0}`, 20, y);
  y += 10;
  pdf.text(`Total Bookmarks: ${analyticsData.totalBookmarks || 0}`, 20, y);
  y += 10;
  pdf.text(`Favorite Category: ${analyticsData.favoriteCategory || 'N/A'}`, 20, y);
  y += 10;
  pdf.text(`Average Reading Time: ${analyticsData.avgReadingTime || 0} minutes`, 20, y);
  y += 15;

  // Top Topics
  if (analyticsData.topTopics && analyticsData.topTopics.length > 0) {
    pdf.setFontSize(16);
    pdf.text('Your Top Topics:', 20, y);
    y += 15;

    analyticsData.topTopics.forEach((topic: any, index: number) => {
      pdf.setFontSize(12);
      pdf.text(`${index + 1}. ${topic.name} (${topic.count} articles)`, 20, y);
      y += 10;
    });
  }

  return pdf;
}