require 'rake'

class Version
  attr_accessor :major, :minor, :patch
  def initialize
    @major, @minor, @patch = File.read(file).split('.').map(&:to_i)
  end

  def file
    "VERSION"
  end

  def bump(quality = :patch)
    unless %i{ major minor patch }.include?(quality)
      raise "Only major, minor or patch bumps are accepted"
    end

    send("#{quality}=", send(quality) + 1)
    File.write(file, to_version)
    to_version
  end

  def to_version
    [@major, @minor, @patch].join('.')
  end
end

desc 'Build configuration files'
task :build do
  Dir.chdir('configs') do
    Dir.glob('*') do |f|
      if File.file?(f)
        `arethusa merge #{f} -mb . > ../dist/#{f}`
        puts "Created dist/#{f}"
      end
    end
  end
end

def git(command)
  system("git #{command}")
end

desc 'Update dist folder, raise version and release'
task :release, [:quality] do |t, args|
  Rake::Task[:build].invoke

  quality = (args[:quality] || :patch).to_sym
  version = Version.new.bump(quality)

  puts
  puts "Raised version to #{version}"

  git('add -A')
  git("commit -m 'Release version #{version}'")
  git("tag -a v#{version} -m 'Version #{version}'")
end
