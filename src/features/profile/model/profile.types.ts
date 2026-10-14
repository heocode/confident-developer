export interface GitHubSummary {
  repositoryCount: number
  languageCount: number
  refreshedAt: string
}

export interface ProfilePost {
  id: string
  text: string
  revision: number
  contentUpdatedAt: string
  likes: number
  views: number
}

export interface ProfilePostInteraction {
  revision: number
  likes: number
  liked: boolean
}

export interface ProfilePostView {
  revision: number
  views: number
  recorded: boolean
}

export interface ProfilePostRevisionInput {
  revision: number
}
