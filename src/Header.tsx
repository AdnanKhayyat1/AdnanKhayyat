export const Header = () => {
  return (
    <header className="fixed top-0 left-0 w-full z-40 p-4 md:p-6 flex justify-between items-start pointer-events-none mix-blend-difference text-white">
      <div className="flex flex-col items-start pointer-events-auto">
        <h1 className="text-xl md:text-2xl font-black tracking-tighter leading-none">
          ADNAN<br/>KHAYYAT
        </h1>
        <div className="mt-2 text-xs md:text-sm font-mono opacity-80">
          EST. 2025<br/>
          NO. 74-211
        </div>
      </div>

      <div className="flex flex-col items-end pointer-events-auto">
        <a 
          href="mailto:adnankhayyat@gmail.com" 
          className="group flex items-center gap-2 text-sm md:text-base font-bold hover:underline decoration-2 underline-offset-4"
        >
          <span>HIRE ME</span>
          <span className="inline-block transition-transform group-hover:-translate-y-1 group-hover:translate-x-1">↗</span>
        </a>
        <div className="mt-2 text-right text-xs md:text-sm font-mono opacity-80 hidden md:block">
          AVAILABLE FOR<br/>IMMEDIATE DEPLOYMENT
        </div>
      </div>
    </header>
  );
};
