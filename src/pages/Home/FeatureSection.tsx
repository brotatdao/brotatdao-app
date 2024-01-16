import { BsWindowPlus } from "react-icons/bs";
import { HiOutlineChatBubbleOvalLeftEllipsis } from "react-icons/hi2";
import { RxChevronRight } from "react-icons/rx";
import { RxAvatar } from "react-icons/rx";


const features = [
  {
    name: 'Create a profile',
    description: 'Give your NFT a name and a profile.  Was it GQ man of the year?  Maybe it sold feet pics in the bear. It do what it do.',
    icon: RxAvatar,
  },
  {
    name: 'Upload your profile and claim a subdomain',
    description: 'Connect your wallet - using Sign In With Ethereum (SIWE) to select an NFT you own. You will sign a transaction but it wont trigger a blockchain event nor cost any gas or fees.  The profile page will upload to IPFS and you will claim your subdomain for free.',
    icon: BsWindowPlus,
  },
  {
    name: 'Tell the bros',
    description: 'Introduce your nft to the world at <yourname>.brotatdao.eth',
    icon: HiOutlineChatBubbleOvalLeftEllipsis,
  },
  {
    name: 'Whats next?',
    description: 'It do what it dao.',
    icon: RxChevronRight,
  },
]

export default function FeatureSection() {
  return (
    <div className="bg-white bg-opacity-0 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Welcome to brotatdao.
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            your NFT has a biography,  a story to tell, a message for the bros.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            {features.map((feature) => (
              <div key={feature.name} className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-600">
                    <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}
