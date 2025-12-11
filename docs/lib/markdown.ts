import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export interface MarkdownContent {
    content: string
    data: {
        title?: string
        description?: string
        [key: string]: any
    }
}

export async function getMarkdownContent(filePath: string): Promise<MarkdownContent | null> {
    try {
        // Support both direct paths and section-based paths
        const fullPath = filePath.startsWith('/')
            ? path.join(process.cwd(), filePath)
            : path.join(process.cwd(), filePath)

        const fileContent = fs.readFileSync(fullPath, 'utf8')
        const { data, content } = matter(fileContent)

        return {
            content,
            data,
        }
    } catch (error) {
        console.error(`Error reading markdown file: ${filePath}`, error)
        return null
    }
}

export async function getAllMarkdownFiles(section: string): Promise<string[]> {
    try {
        const sectionPath = path.join(process.cwd(), section)

        if (!fs.existsSync(sectionPath)) {
            return []
        }

        const files = fs.readdirSync(sectionPath)
        return files
            .filter(file => file.endsWith('.md'))
            .map(file => path.join(section, file))
    } catch (error) {
        console.error(`Error reading markdown files from section: ${section}`, error)
        return []
    }
}
