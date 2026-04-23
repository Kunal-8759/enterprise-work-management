
function HealthCheck(){

    return (
        <>
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-10 flex flex-col items-center gap-4">
                <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    Enterprise Work Management System
                </h1>
                <p className="text-gray-500 dark:text-gray-300 text-sm">
                    Tailwind v4 is working
                </p>
                <span className="px-4 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                    App Running
                </span>
                </div>
            </div>
        </>

    )
}

export default HealthCheck;